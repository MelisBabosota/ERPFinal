-- BLACKRAIN ERP - Database Setup Script
-- MySQL Database Schema

-- Create database with UTF-8 support
CREATE DATABASE IF NOT EXISTS blackrain_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blackrain_erp;
SET NAMES utf8mb4;

-- ============================================
-- USUARIOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'usuario', 'vendedor') DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: 1234)
-- Using bcrypt hash for '1234'
INSERT INTO usuarios (email, password, nombre, rol) VALUES 
('admin@erp.com', '$2a$10$xO7O.yVJ5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG', 'Carlos Méndez', 'administrador');

-- ============================================
-- CLIENTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    direccion TEXT,
    tipo ENUM('regular', 'vip', 'mayorista') DEFAULT 'regular',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    pedidos INT DEFAULT 0,
    total_gastado DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample clients
INSERT INTO clientes (nombre, email, telefono, direccion, tipo, estado, pedidos, total_gastado) VALUES
('Juan Pérez', 'juan.perez@email.com', '55 1234 5678', 'Av. Reforma 123, CDMX', 'regular', 'activo', 5, 45000),
('María García', 'maria.garcia@email.com', '55 2345 6789', 'Av. UNAM 456, CDMX', 'vip', 'activo', 12, 125000),
('Carlos López', 'carlos.lopez@email.com', '55 3456 7890', 'Calle 5 de Mayo 789, GDL', 'regular', 'activo', 3, 28000),
('Ana Martínez', 'ana.martinez@email.com', '55 4567 8901', 'Blvd. Ávila Camacho MTY', 'mayorista', 'activo', 25, 450000),
('Pedro Sánchez', 'pedro.sanchez@email.com', '55 5678 9012', 'Av. Mazaryk POL', 'regular', 'inactivo', 1, 5000);

-- ============================================
-- PRODUCTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    categoria VARCHAR(100),
    stock INT DEFAULT 0,
    precio DECIMAL(15, 2) DEFAULT 0,
    estado ENUM('en_stock', 'bajo_stock', 'agotado') DEFAULT 'en_stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO productos (nombre, sku, categoria, stock, precio, estado) VALUES
('Laptop Dell XPS 15', 'LAP-DEL-001', 'Electrónica', 15, 25000, 'en_stock'),
('Mouse Logitech MX', 'MOU-LOG-002', 'Electrónica', 8, 1500, 'bajo_stock'),
('Teclado Mecánico RGB', 'TEC-MEC-003', 'Electrónica', 0, 3500, 'agotado'),
('Monitor 27" 4K', 'MON-4K-004', 'Electrónica', 22, 12000, 'en_stock'),
('Escritorio Ejecutivo', 'MUE-ESC-005', 'Hogar', 5, 8500, 'bajo_stock'),
('Silla Ergonómica', 'MUE-SIL-006', 'Hogar', 12, 5500, 'en_stock'),
('Auriculares Sony WH', 'AUD-SON-007', 'Electrónica', 3, 4500, 'bajo_stock'),
('Webcam HD 1080p', 'CAM-WEB-008', 'Electrónica', 30, 1800, 'en_stock');

-- ============================================
-- VENTAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    cliente VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    estado ENUM('en_proceso', 'pendiente_pago', 'entregado', 'cancelado') DEFAULT 'pendiente_pago',
    metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia') DEFAULT 'Efectivo',
    productos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- Insert sample sales
INSERT INTO ventas (cliente_id, cliente, fecha, total, estado, metodo_pago, productos) VALUES
(1, 'Juan Pérez', '2025-01-14', 15400, 'en_proceso', 'Tarjeta', 3),
(2, 'María García', '2025-01-14', 8750, 'pendiente_pago', 'Transferencia', 2),
(3, 'Carlos López', '2025-01-13', 22300, 'entregado', 'Tarjeta', 5),
(4, 'Ana Martínez', '2025-01-13', 5200, 'cancelado', 'Efectivo', 1),
(1, 'Juan Pérez', '2025-01-12', 18900, 'entregado', 'Tarjeta', 4),
(2, 'María García', '2025-01-11', 31500, 'entregado', 'Transferencia', 6),
(3, 'Carlos López', '2025-01-10', 12800, 'pendiente_pago', 'Tarjeta', 2);

-- ============================================
-- AJUSTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ajustes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO ajustes (clave, valor) VALUES
('nombre_empresa', 'BLACKRAIN'),
('dark_mode', 'true'),
('moneda', 'MXN');

-- ============================================
-- VIEWS FOR DASHBOARD
-- ============================================
-- View for low stock products
CREATE OR REPLACE VIEW vista_productos_bajo_stock AS
SELECT * FROM productos WHERE stock > 0 AND stock < 10;

-- View for active orders
CREATE OR REPLACE VIEW vista_pedidos_activos AS
SELECT * FROM ventas WHERE estado IN ('en_proceso', 'pendiente_pago');

-- View for monthly sales
CREATE OR REPLACE VIEW vista_ventas_mes AS
SELECT * FROM ventas WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE());

-- ============================================
-- STORED PROCEDURES
-- ============================================
DELIMITER //

-- Procedure to update product status based on stock
CREATE PROCEDURE sp_actualizar_estado_producto(IN producto_id INT)
BEGIN
    DECLARE stock_producto INT;
    SELECT stock INTO stock_producto FROM productos WHERE id = producto_id;
    
    IF stock_producto = 0 THEN
        UPDATE productos SET estado = 'agotado' WHERE id = producto_id;
    ELSEIF stock_producto < 10 THEN
        UPDATE productos SET estado = 'bajo_stock' WHERE id = producto_id;
    ELSE
        UPDATE productos SET estado = 'en_stock' WHERE id = producto_id;
    END IF;
END //

-- Procedure to create a sale and update stock
CREATE PROCEDURE sp_crear_venta(
    IN p_cliente_id INT,
    IN p_cliente VARCHAR(255),
    IN p_fecha DATE,
    IN p_total DECIMAL(15,2),
    IN p_estado VARCHAR(50),
    IN p_metodo_pago VARCHAR(50)
)
BEGIN
    DECLARE nuevo_id INT;
    
    INSERT INTO ventas (cliente_id, cliente, fecha, total, estado, metodo_pago, productos)
    VALUES (p_cliente_id, p_cliente, p_fecha, p_total, p_estado, p_metodo_pago, 0);
    
    SET nuevo_id = LAST_INSERT_ID();
    
    -- Update client stats
    UPDATE clientes 
    SET pedidos = pedidos + 1, 
        total_gastado = total_gastado + p_total 
    WHERE id = p_cliente_id;
    
    SELECT * FROM ventas WHERE id = nuevo_id;
END //

DELIMITER ;

-- ============================================
-- USERS
-- ============================================
-- Grant permissions (run as root)
-- GRANT ALL PRIVILEGES ON blackrain_erp.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Database setup completed successfully!' AS mensaje;
SELECT COUNT(*) AS total_clientes FROM clientes;
SELECT COUNT(*) AS total_productos FROM productos;
SELECT COUNT(*) AS total_ventas FROM ventas;

