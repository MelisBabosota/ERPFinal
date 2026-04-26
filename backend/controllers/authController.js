const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const JWT_SECRET = "blackrain_erp_secret_key_2024"

// Mock users database
const users = [
  {
    id: 1,
    email: "admin@erp.com",
    password: "$2a$10$xO7O.yVJ5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG", // 1234
    nombre: "Carlos Méndez",
    rol: "administrador"
  }
]

// Mock clients for demo
const mockClientes = [
  { id: 1, nombre: "Juan Pérez", email: "juan.perez@email.com", telefono: "55 1234 5678", direccion: "Av. Reforma 123, CDMX", tipo: "regular", estado: "activo", pedidos: 5, total_gastado: 45000, created_at: new Date("2024-01-15") },
  { id: 2, nombre: "María García", email: "maria.garcia@email.com", telefono: "55 2345 6789", direccion: "Av. UNAM 456, CDMX", tipo: "vip", estado: "activo", pedidos: 12, total_gastado: 125000, created_at: new Date("2024-02-20") },
  { id: 3, nombre: "Carlos López", email: "carlos.lopez@email.com", telefono: "55 3456 7890", direccion: "Calle 5 de Mayo 789, GDL", tipo: "regular", estado: "activo", pedidos: 3, total_gastado: 28000, created_at: new Date("2024-03-10") },
  { id: 4, nombre: "Ana Martínez", email: "ana.martinez@email.com", telefono: "55 4567 8901", direccion: "Blvd. Ávila Camacho MTY", tipo: "mayorista", estado: "activo", pedidos: 25, total_gastado: 450000, created_at: new Date("2024-04-05") },
  { id: 5, nombre: "Pedro Sánchez", email: "pedro.sanchez@email.com", telefono: "55 5678 9012", direccion: "Av. Mazaryk POL", tipo: "regular", estado: "inactivo", pedidos: 1, total_gastado: 5000, created_at: new Date("2024-05-01") },
]

// Mock products for demo
const mockProductos = [
  { id: 1, nombre: "Laptop Dell XPS 15", sku: "LAP-DEL-001", categoria: "Electrónica", stock: 15, precio: 25000, estado: "en_stock", created_at: new Date("2024-01-10") },
  { id: 2, nombre: "Mouse Logitech MX", sku: "MOU-LOG-002", categoria: "Electrónica", stock: 8, precio: 1500, estado: "bajo_stock", created_at: new Date("2024-01-15") },
  { id: 3, nombre: "Teclado Mecánico RGB", sku: "TEC-MEC-003", categoria: "Electrónica", stock: 0, precio: 3500, estado: "agotado", created_at: new Date("2024-02-01") },
  { id: 4, nombre: "Monitor 27\" 4K", sku: "MON-4K-004", categoria: "Electrónica", stock: 22, precio: 12000, estado: "en_stock", created_at: new Date("2024-02-10") },
  { id: 5, nombre: "Escritorio Ejecutivo", sku: "MUE-ESC-005", categoria: "Hogar", stock: 5, precio: 8500, estado: "bajo_stock", created_at: new Date("2024-03-01") },
  { id: 6, nombre: "Silla Ergonómica", sku: "MUE-SIL-006", categoria: "Hogar", stock: 12, precio: 5500, estado: "en_stock", created_at: new Date("2024-03-15") },
  { id: 7, nombre: "Auriculares Sony WH", sku: "AUD-SON-007", categoria: "Electrónica", stock: 3, precio: 4500, estado: "bajo_stock", created_at: new Date("2024-04-01") },
  { id: 8, nombre: "Webcam HD 1080p", sku: "CAM-WEB-008", categoria: "Electrónica", stock: 30, precio: 1800, estado: "en_stock", created_at: new Date("2024-04-10") },
]

// Mock sales for demo
const mockVentas = [
  { id: 1, cliente_id: 1, cliente: "Juan Pérez", fecha: "2025-01-14", total: 15400, estado: "en_proceso", metodo_pago: "Tarjeta", productos: 3 },
  { id: 2, cliente_id: 2, cliente: "María García", fecha: "2025-01-14", total: 8750, estado: "pendiente_pago", metodo_pago: "Transferencia", productos: 2 },
  { id: 3, cliente_id: 3, cliente: "Carlos López", fecha: "2025-01-13", total: 22300, estado: "entregado", metodo_pago: "Tarjeta", productos: 5 },
  { id: 4, cliente_id: 4, cliente: "Ana Martínez", fecha: "2025-01-13", total: 5200, estado: "cancelado", metodo_pago: "Efectivo", productos: 1 },
  { id: 5, cliente_id: 1, cliente: "Juan Pérez", fecha: "2025-01-12", total: 18900, estado: "entregado", metodo_pago: "Tarjeta", productos: 4 },
]

// In-memory data stores
let clientes = [...mockClientes]
let productos = [...mockProductos]
let ventas = [...mockVentas]
let nextClienteId = 6
let nextProductoId = 9
let nextVentaId = 6

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado" })
  }
  
  const token = authHeader.split(" ")[1]
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" })
  }
}

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body

  // Demo credentials check
  if (email === "admin@erp.com" && password === "1234") {
    const token = jwt.sign(
      { email, id: 1, nombre: "Carlos Méndez", rol: "administrador" },
      JWT_SECRET,
      { expiresIn: "24h" }
    )
    
    return res.json({
      token,
      email,
      nombre: "Carlos Méndez",
      rol: "administrador"
    })
  }

  // Check database if available
  try {
    const pool = req.app.get("db")
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email])
    
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    const user = rows[0]
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    const token = jwt.sign(
      { email: user.email, id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    res.json({
      token,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    })
  } catch (error) {
    // If no database, use demo
    return res.status(401).json({ message: "Credenciales incorrectas" })
  }
}

// Register
exports.register = async (req, res) => {
  const { email, password, nombre } = req.body
  
  try {
    const pool = req.app.get("db")
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await pool.query(
      "INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, nombre, "usuario"]
    )
    
    res.status(201).json({ message: "Usuario registrado exitosamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario" })
  }
}

exports.authMiddleware = authMiddleware
exports.clientes = clientes
exports.productos = productos
exports.ventas = ventas
exports.nextClienteId = () => nextClienteId++
exports.nextProductoId = () => nextProductoId++
exports.nextVentaId = () => nextVentaId++
exports.setClientes = (data) => { clientes = data }
exports.setProductos = (data) => { productos = data }
exports.setVentas = (data) => { ventas = data }

