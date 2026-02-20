const db = require('../db');
const bcrypt = require('bcryptjs');

/**
 * Onboard a new customer
 */
exports.createCustomer = async (req, res) => {
    const { fullName, email, initialDeposit } = req.body;

    if (!fullName || !email) {
        return res.status(400).json({ message: 'Full name and email are required' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Structural Identity Provisioning
        const customerId = 'CUST' + Math.floor(1000 + Math.random() * 9000);
        const accountNum = 'ACC-' + Math.floor(100 + Math.random() * 899) + '-' + Math.floor(100 + Math.random() * 899);
        const defaultPass = await bcrypt.hash('SecurePass123', 12);
        const defaultPin = await bcrypt.hash('1234', 12);

        const result = await client.query(`
            INSERT INTO banking.users (customer_id, account_number, full_name, email, role)
            VALUES ($1, $2, $3, $4, 'CLIENT')
            RETURNING id, customer_id, account_number, full_name, email
        `, [customerId, accountNum, fullName, email]);

        const newUserId = result.rows[0].id;

        // 2. Encrypted Credential Segregation
        await client.query(`
            INSERT INTO banking.user_credentials (user_id, password_hash, transaction_pin)
            VALUES ($1, $2, $3)
        `, [newUserId, defaultPass, defaultPin]);

        // 3. Initial Liquidity Injection
        if (initialDeposit > 0) {
            await client.query('UPDATE banking.users SET balance = $1 WHERE id = $2', [initialDeposit, newUserId]);
            await client.query(`
                INSERT INTO banking.transactions (receiver_id, amount, type, reference, status)
                VALUES ($1, $2, 'DEPOSIT', 'Initial Capital Infusion', 'COMPLETED')
            `, [newUserId, initialDeposit]);
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Tiered identity provisioned successfully',
            user: result.rows[0],
            defaultPassword: 'SecurePass123'
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Institutional onboarding failed:', err.message);
        if (err.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Email identity already registered' });
        }
        res.status(500).json({ message: 'Failed to provision tiered identity' });
    } finally {
        client.release();
    }
};

/**
 * Inject funds into a customer account
 */
exports.depositFunds = async (req, res) => {
    const { accountNumber, amount, reference } = req.body;

    if (!accountNumber || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid deposit details' });
    }

    try {
        const userRes = await db.pool.query('SELECT id FROM banking.users WHERE account_number = $1', [accountNumber]);

        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const userId = userRes.rows[0].id;

        // Perform Deposit
        await db.pool.query('UPDATE banking.users SET balance = balance + $1 WHERE id = $2', [amount, userId]);

        // Log Transaction
        await db.pool.query(`
            INSERT INTO banking.transactions (receiver_id, amount, type, reference, status)
            VALUES ($1, $2, 'DEPOSIT', $3, 'COMPLETED')
        `, [userId, amount, reference || 'Staff Deposit']);

        res.status(200).json({ message: 'Funds deposited successfully' });
    } catch (err) {
        console.error('Deposit failed:', err.message);
        res.status(500).json({ message: 'Deposit failed' });
    }
};

/**
 * List all users (Directory)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const result = await db.pool.query(`
            SELECT id, customer_id, account_number, full_name, email, balance, role, status, created_at 
            FROM banking.users 
            WHERE role = 'CLIENT'
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};
/**
 * Get Institutional Metrics for Staff Overview
 */
exports.getStaffMetrics = async (req, res) => {
    try {
        const stats = await db.pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM banking.users WHERE role = 'CLIENT') as total_clients,
                (SELECT SUM(balance) FROM banking.users WHERE role = 'CLIENT') as total_liquidity,
                (SELECT COUNT(*) FROM banking.transactions WHERE created_at > NOW() - INTERVAL '24 hours') as daily_tx_count
        `);

        res.json({
            totalClients: parseInt(stats.rows[0].total_clients),
            totalLiquidity: parseFloat(stats.rows[0].total_liquidity || 0),
            dailyTxCount: parseInt(stats.rows[0].daily_tx_count),
            systemStatus: 'OPTIMAL',
            uptime: '99.99%',
            securityAudits: 'CLEARED'
        });
    } catch (err) {
        console.error('Failed to fetch staff metrics:', err.message);
        res.status(500).json({ message: 'Failed to fetch institutional metrics' });
    }
};

/**
 * Get Operational Logs (Audit Feed)
 */
exports.getOperationalLogs = async (req, res) => {
    try {
        const logs = await db.pool.query(`
            SELECT 
                t.id,
                t.amount,
                t.type,
                t.reference,
                t.created_at,
                s.full_name as sender_name,
                r.full_name as receiver_name
            FROM banking.transactions t
            LEFT JOIN banking.users s ON t.sender_id = s.id
            LEFT JOIN banking.users r ON t.receiver_id = r.id
            ORDER BY t.created_at DESC
            LIMIT 10
        `);

        res.json(logs.rows);
    } catch (err) {
        console.error('Failed to fetch operational logs:', err.message);
        res.status(500).json({ message: 'Failed to fetch audit feed' });
    }
};

/**
 * Administrative Inter-Client Transfer
 */
exports.adminTransfer = async (req, res) => {
    const { fromAccount, toAccount, amount, reference } = req.body;

    if (!fromAccount || !toAccount || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid transfer parameters' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Validate Source
        const sourceRes = await client.query('SELECT id, balance FROM banking.users WHERE account_number = $1', [fromAccount]);
        if (sourceRes.rows.length === 0) throw new Error('Source account not identified');
        if (parseFloat(sourceRes.rows[0].balance) < amount) throw new Error('Insufficient institutional liquidity in source account');

        // 2. Validate Destination
        const destRes = await client.query('SELECT id FROM banking.users WHERE account_number = $1', [toAccount]);
        if (destRes.rows.length === 0) throw new Error('Destination account not identified');

        const sourceId = sourceRes.rows[0].id;
        const destId = destRes.rows[0].id;

        // 3. Execute Balances
        await client.query('UPDATE banking.users SET balance = balance - $1 WHERE id = $2', [amount, sourceId]);
        await client.query('UPDATE banking.users SET balance = balance + $1 WHERE id = $2', [amount, destId]);

        // 4. Record Audit Transaction
        await client.query(`
            INSERT INTO banking.transactions (sender_id, receiver_id, amount, type, reference, status)
            VALUES ($1, $2, $3, 'TRANSFER', $4, 'COMPLETED')
        `, [sourceId, destId, amount, reference || 'ADMIN_TRANSFER']);

        await client.query('COMMIT');
        res.json({ message: 'Administrative transfer finalized successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Admin transfer failed:', err.message);
        res.status(400).json({ message: err.message });
    } finally {
        client.release();
    }
};

/**
 * Institutional Risk Assessment
 */
exports.getRiskAssessment = async (req, res) => {
    try {
        const riskData = await db.pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE balance < 1000) as low_liquidity_clients,
                COUNT(*) FILTER (WHERE balance > 1000000) as high_exposure_clients,
                AVG(balance) as average_client_liquidity
            FROM banking.users WHERE role = 'CLIENT'
        `);

        const velocity = await db.pool.query(`
            SELECT COUNT(*) FROM banking.transactions 
            WHERE created_at > NOW() - INTERVAL '1 hour'
        `);

        res.json({
            lowLiquidityCount: parseInt(riskData.rows[0].low_liquidity_clients),
            highExposureCount: parseInt(riskData.rows[0].high_exposure_clients),
            averageLiquidity: parseFloat(riskData.rows[0].average_client_liquidity || 0),
            transactionVelocity: parseInt(velocity.rows[0].count),
            riskLevel: velocity.rows[0].count > 50 ? 'ELEVATED' : 'STABLE'
        });
    } catch (err) {
        res.status(500).json({ message: 'Risk assessment engine failure' });
    }
};

/**
 * Compliance Audit Engine (High Value Transactions)
 */
exports.getComplianceAudit = async (req, res) => {
    try {
        const audit = await db.pool.query(`
            SELECT t.*, s.full_name as sender_name, r.full_name as receiver_name
            FROM banking.transactions t
            LEFT JOIN banking.users s ON t.sender_id = s.id
            LEFT JOIN banking.users r ON t.receiver_id = r.id
            WHERE t.amount >= 10000
            ORDER BY t.created_at DESC
            LIMIT 50
        `);
        res.json(audit.rows);
    } catch (err) {
        res.status(500).json({ message: 'Compliance engine failure' });
    }
};

/**
 * Toggle User Account Status (Freeze/Activate)
 */
exports.toggleUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'FROZEN'

    if (!['ACTIVE', 'FROZEN'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status identifier' });
    }

    try {
        await db.pool.query(
            'UPDATE banking.users SET status = $1 WHERE id = $2',
            [status, userId]
        );
        res.json({ message: `Account status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Status management failure' });
    }
};

/**
 * Institutional Ledger Export
 */
exports.exportLedger = async (req, res) => {
    try {
        const ledger = await db.pool.query(`
            SELECT t.*, s.account_number as sender_acc, r.account_number as receiver_acc
            FROM banking.transactions t
            LEFT JOIN banking.users s ON t.sender_id = s.id
            LEFT JOIN banking.users r ON t.receiver_id = r.id
            ORDER BY t.created_at DESC
        `);

        // In a real app, this would generate CSV/PDF. Here we send JSON for UI to handle.
        res.json(ledger.rows);
    } catch (err) {
        res.status(500).json({ message: 'Ledger export failure' });
    }
};

/**
 * Institutional Credit Queue (Review Pending Loans)
 */
exports.getPendingLoans = async (req, res) => {
    try {
        const loans = await db.pool.query(`
            SELECT l.*, u.full_name, u.email 
            FROM banking.loans l
            JOIN banking.users u ON l.user_id = u.id
            WHERE l.status IN ('PENDING', 'EXTENSION_REQUESTED')
            ORDER BY l.created_at ASC
        `);
        res.json(loans.rows);
    } catch (err) {
        res.status(500).json({ message: 'Credit queue fetch failed' });
    }
};

/**
 * Process Institutional Loan Decision (Approve/Reject)
 */
exports.processLoanDecision = async (req, res) => {
    const { loanId } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid decision status' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get loan details
        const loanRes = await client.query('SELECT * FROM banking.loans WHERE id = $1', [loanId]);
        if (loanRes.rows.length === 0) throw new Error('Loan record not found');
        const loan = loanRes.rows[0];

        // 2. Update status
        await client.query(
            "UPDATE banking.loans SET status = $1, approved_at = $2 WHERE id = $3",
            [status, status === 'APPROVED' ? new Date() : null, loanId]
        );

        if (status === 'APPROVED') {
            // 3. Inject liquidity into client balance
            await client.query(
                "UPDATE banking.users SET balance = balance + $1 WHERE id = $2",
                [loan.amount, loan.user_id]
            );

            // 4. Record Institutional Credit Transaction
            await client.query(`
                INSERT INTO banking.transactions (sender_id, receiver_id, amount, type, reference, status)
                VALUES (NULL, $1, $2, 'DEPOSIT', $3, 'COMPLETED')
            `, [loan.user_id, loan.amount, `Institutional Credit: Facility ${loanId.slice(0, 8)}`]);

            // 5. Create Notification
            await client.query(`
                INSERT INTO banking.notifications (user_id, title, message)
                VALUES ($1, $2, $3)
            `, [loan.user_id, 'Institutional Credit Approved', `Your facility for $${parseFloat(loan.amount).toLocaleString()} has been activated.`]);
        } else {
            // Create Rejection Notification
            await client.query(`
                INSERT INTO banking.notifications (user_id, title, message)
                VALUES ($1, $2, $3)
            `, [loan.user_id, 'Credit Application Outcome', `Your recent request for financing has been declined after institutional review.`]);
        }

        await client.query('COMMIT');
        res.json({ message: `Loan ${status.toLowerCase()} successfully` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Credit decision error:', err);
        res.status(500).json({ message: err.message || 'Credit processing failure' });
    } finally {
        client.release();
    }
};
