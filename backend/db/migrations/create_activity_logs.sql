-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_type VARCHAR(20) NOT NULL, -- 'student', 'professor', 'admin'
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'view', 'download'
    resource_type VARCHAR(100), -- 'course', 'book', 'file', 'user', etc.
    resource_id INTEGER,
    resource_name VARCHAR(500),
    details JSONB, -- Additional details
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type ON activity_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_desc ON activity_logs(created_at DESC);
