const express = require("express")
const cors = require("cors")
const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const fs = require("fs")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// SQLite database path
const DB_PATH = path.join(__dirname, "blackrain_erp.db")
const db = new sqlite3.Database(DB_PATH)

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON")

// Initialize database with schema and data
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables
      db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nombre TEXT NOT NULL,
        rol TEXT DEFAULT 'usuario',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefono TEXT,
        direccion TEXT,
        tipo TEXT DEFAULT 'regular',
        estado TEXT DEFAULT 'activo',
        pedidos INTEGER DEFAULT 0,
        total_gastado REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      db.run(`CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        categoria TEXT,
        stock INTEGER DEFAULT 0,
        precio REAL DEFAULT 0,
        estado TEXT DEFAULT 'en_stock',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      db.run(`CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        cliente TEXT NOT NULL,
        fecha TEXT NOT NULL,
        total REAL NOT NULL,
        estado TEXT DEFAULT 'pendiente_pago',
        metodo_pago TEXT DEFAULT 'Efectivo',
        productos INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
      )`)

      db.run(`CREATE TABLE IF NOT EXISTS ajustes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clave TEXT UNIQUE NOT NULL,
        valor TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      // Check if data already exists
      db.get("SELECT COUNT(*) as count FROM usuarios", (err, row) => {
        if (err) {
          console.error("Error checking data:", err)
          reject(err)
          return
        }

        if (row.count === 0) {
          // Insert default data
          const stmt1 = db.prepare("INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)")
          stmt1.run('admin@erp.com', '$2a$10$xO7O.yVJ5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG5.sKjG', 'Carlos Méndez', 'administrador')
          stmt1.finalize()

          const stmt2 = db.prepare("INSERT INTO clientes (nombre, email, telefono, direccion, tipo, estado, pedidos, total_gastado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
          stmt2.run('Juan Pérez', 'juan.perez@email.com', '55 1234 5678', 'Av. Reforma 123, CDMX', 'regular', 'activo', 5, 45000)
          stmt2.run('María García', 'maria.garcia@email.com', '55 2345 6789', 'Av. UNAM 456, CDMX', 'vip', 'activo', 12, 125000)
          stmt2.run('Carlos López', 'carlos.lopez@email.com', '55 3456 7890', 'Calle 5 de Mayo 789, GDL', 'regular', 'activo', 3, 28000)
          stmt2.run('Ana Martínez', 'ana.martinez@email.com', '55 4567 8901', 'Blvd. Ávila Camacho MTY', 'mayorista', 'activo', 25, 450000)
          stmt2.run('Pedro Sánchez', 'pedro.sanchez@email.com', '55 5678 9012', 'Av. Mazaryk POL', 'regular', 'inactivo', 1, 5000)
          stmt2.finalize()

          const stmt3 = db.prepare("INSERT INTO productos (nombre, sku, categoria, stock, precio, estado) VALUES (?, ?, ?, ?, ?, ?)")
          stmt3.run('Laptop Dell XPS 15', 'LAP-DEL-001', 'Electrónica', 15, 25000, 'en_stock')
          stmt3.run('Mouse Logitech MX', 'MOU-LOG-002', 'Electrónica', 8, 1500, 'bajo_stock')
          stmt3.run('Teclado Mecánico RGB', 'TEC-MEC-003', 'Electrónica', 0, 3500, 'agotado')
          stmt3.run('Monitor 27" 4K', 'MON-4K-004', 'Electrónica', 22, 12000, 'en_stock')
          stmt3.run('Escritorio Ejecutivo', 'MUE-ESC-005', 'Hogar', 5, 8500, 'bajo_stock')
          stmt3.run('Silla Ergonómica', 'MUE-SIL-006', 'Hogar', 12, 5500, 'en_stock')
          stmt3.run('Auriculares Sony WH', 'AUD-SON-007', 'Electrónica', 3, 4500, 'bajo_stock')
          stmt3.run('Webcam HD 1080p', 'CAM-WEB-008', 'Electrónica', 30, 1800, 'en_stock')
          stmt3.finalize()

          const stmt4 = db.prepare("INSERT INTO ventas (cliente_id, cliente, fecha, total, estado, metodo_pago, productos) VALUES (?, ?, ?, ?, ?, ?, ?)")
          stmt4.run(1, 'Juan Pérez', '2025-01-14', 15400, 'en_proceso', 'Tarjeta', 3)
          stmt4.run(2, 'María García', '2025-01-14', 8750, 'pendiente_pago', 'Transferencia', 2)
          stmt4.run(3, 'Carlos López', '2025-01-13', 22300, 'entregado', 'Tarjeta', 5)
          stmt4.run(4, 'Ana Martínez', '2025-01-13', 5200, 'cancelado', 'Efectivo', 1)
          stmt4.run(1, 'Juan Pérez', '2025-01-12', 18900, 'entregado', 'Tarjeta', 4)
          stmt4.run(2, 'María García', '2025-01-11', 31500, 'entregado', 'Transferencia', 6)
          stmt4.run(3, 'Carlos López', '2025-01-10', 12800, 'pendiente_pago', 'Tarjeta', 2)
          stmt4.finalize()

          const stmt5 = db.prepare("INSERT INTO ajustes (clave, valor) VALUES (?, ?)")
          stmt5.run('nombre_empresa', 'BLACKRAIN')
          stmt5.run('dark_mode', 'true')
          stmt5.run('moneda', 'MXN')
          stmt5.finalize()

          console.log("✅ Base de datos SQLite inicializada con datos de ejemplo")
        } else {
          console.log("✅ Base de datos SQLite ya contiene datos")
        }
        resolve()
      })
    })
  })
}

// Promisify db methods for async/await
const dbAsync = {
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  },
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err)
        else resolve({ lastID: this.lastID, changes: this.changes })
      })
    })
  }
}

// Make db available to routes
app.set("db", dbAsync)

// JWT Secret
const JWT_SECRET = "blackrain_erp_secret_key_2024"
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

// Auth middleware
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

// ============ AUTH ROUTES ============
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body

  // Demo credentials check
  if (email === "ositodepeluche@oso.com.mx" && password === "Osito#123") {
    const token = jwt.sign(
      { email, id: 1, nombre: "Administrador", rol: "administrador" },
      JWT_SECRET,
      { expiresIn: "24h" }
    )
    return res.json({ token, email, nombre: "Administrador", rol: "administrador" })
  }

  try {
    const user = await dbAsync.get("SELECT * FROM usuarios WHERE email = ?", [email])
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }
    const token = jwt.sign(
      { email: user.email, id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "24h" }
    )
    res.json({ token, email: user.email, nombre: user.nombre, rol: user.rol })
  } catch (error) {
    return res.status(401).json({ message: "Credenciales incorrectas" })
  }
})

app.post("/api/auth/register", async (req, res) => {
  const { email, password, nombre } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await dbAsync.run(
      "INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, nombre, "usuario"]
    )
    res.status(201).json({ message: "Usuario registrado exitosamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario" })
  }
})

const PDFDocument = require("pdfkit")

// ============ PDF GENERATION HELPERS ============
function generateClientePDF(doc, cliente) {
  doc.fontSize(20).text("FICHA DE CLIENTE", 50, 50)
  doc.moveDown()
  doc.fontSize(12).text(`ID: ${cliente.id}`)
  doc.text(`Nombre: ${cliente.nombre}`)
  doc.text(`Email: ${cliente.email}`)
  doc.text(`Teléfono: ${cliente.telefono || "N/A"}`)
  doc.text(`Dirección: ${cliente.direccion || "N/A"}`)
  doc.text(`Tipo: ${cliente.tipo}`)
  doc.text(`Estado: ${cliente.estado}`)
  doc.text(`Pedidos: ${cliente.pedidos}`)
  doc.text(`Total Gastado: $${cliente.total_gastado}`)
  doc.text(`Registrado: ${cliente.created_at}`)
  doc.end()
}

function generateProductoPDF(doc, producto) {
  doc.fontSize(20).text("FICHA DE PRODUCTO", 50, 50)
  doc.moveDown()
  doc.fontSize(12).text(`ID: ${producto.id}`)
  doc.text(`Nombre: ${producto.nombre}`)
  doc.text(`SKU: ${producto.sku}`)
  doc.text(`Categoría: ${producto.categoria || "N/A"}`)
  doc.text(`Stock: ${producto.stock}`)
  doc.text(`Precio: $${producto.precio}`)
  doc.text(`Estado: ${producto.estado}`)
  doc.text(`Registrado: ${producto.created_at}`)
  doc.end()
}

function generateVentaPDF(doc, venta) {
  doc.fontSize(20).text("COMPROBANTE DE VENTA", 50, 50)
  doc.moveDown()
  doc.fontSize(14).text(`Pedido #${venta.id}`)
  doc.moveDown()
  doc.fontSize(12).text(`Cliente: ${venta.cliente}`)
  doc.text(`Fecha: ${venta.fecha}`)
  doc.text(`Total: $${venta.total}`)
  doc.text(`Estado: ${venta.estado}`)
  doc.text(`Método de Pago: ${venta.metodo_pago}`)
  doc.text(`Productos: ${venta.productos}`)
  doc.text(`Registrado: ${venta.created_at}`)
  doc.moveDown(2)
  doc.fontSize(10).fillColor("gray").text("BLACKRAIN ERP - Documento generado automáticamente")
  doc.end()
}

// ============ PDF ROUTES ============
app.get("/api/clientes/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const row = await dbAsync.get("SELECT * FROM clientes WHERE id = ?", [req.params.id])
    if (!row) return res.status(404).json({ message: "Cliente no encontrado" })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=cliente_${row.id}_${row.nombre.replace(/\s+/g, "_")}.pdf`)

    const doc = new PDFDocument()
    doc.pipe(res)
    generateClientePDF(doc, row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get("/api/productos/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const row = await dbAsync.get("SELECT * FROM productos WHERE id = ?", [req.params.id])
    if (!row) return res.status(404).json({ message: "Producto no encontrado" })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=producto_${row.id}_${row.nombre.replace(/\s+/g, "_")}.pdf`)

    const doc = new PDFDocument()
    doc.pipe(res)
    generateProductoPDF(doc, row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get("/api/ventas/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const row = await dbAsync.get("SELECT * FROM ventas WHERE id = ?", [req.params.id])
    if (!row) return res.status(404).json({ message: "Venta no encontrada" })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=venta_${row.id}_${row.cliente.replace(/\s+/g, "_")}.pdf`)

    const doc = new PDFDocument()
    doc.pipe(res)
    generateVentaPDF(doc, row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ============ CLIENTES ROUTES ============
app.get("/api/clientes", authMiddleware, async (req, res) => {
  try {
    const rows = await dbAsync.all("SELECT * FROM clientes ORDER BY created_at DESC")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get("/api/clientes/:id", authMiddleware, async (req, res) => {
  try {
    const row = await dbAsync.get("SELECT * FROM clientes WHERE id = ?", [req.params.id])
    if (!row) return res.status(404).json({ message: "Cliente no encontrado" })
    res.json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post("/api/clientes", authMiddleware, async (req, res) => {
  const { nombre, email, telefono, direccion, tipo, estado } = req.body
  try {
    const result = await dbAsync.run(
      "INSERT INTO clientes (nombre, email, telefono, direccion, tipo, estado, pedidos, total_gastado) VALUES (?, ?, ?, ?, ?, ?, 0, 0)",
      [nombre, email, telefono, direccion, tipo || "regular", estado || "activo"]
    )
    const row = await dbAsync.get("SELECT * FROM clientes WHERE id = ?", [result.lastID])
    res.status(201).json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.put("/api/clientes/:id", authMiddleware, async (req, res) => {
  const { nombre, email, telefono, direccion, tipo, estado } = req.body
  try {
    await dbAsync.run(
      "UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ?, tipo = ?, estado = ? WHERE id = ?",
      [nombre, email, telefono, direccion, tipo, estado, req.params.id]
    )
    const row = await dbAsync.get("SELECT * FROM clientes WHERE id = ?", [req.params.id])
    res.json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete("/api/clientes/:id", authMiddleware, async (req, res) => {
  try {
    await dbAsync.run("DELETE FROM clientes WHERE id = ?", [req.params.id])
    res.json({ message: "Cliente eliminado exitosamente" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ============ PRODUCTOS ROUTES ============
app.get("/api/productos", authMiddleware, async (req, res) => {
  try {
    const rows = await dbAsync.all("SELECT * FROM productos ORDER BY created_at DESC")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get("/api/productos/:id", authMiddleware, async (req, res) => {
  try {
    const row = await dbAsync.get("SELECT * FROM productos WHERE id = ?", [req.params.id])
    if (!row) return res.status(404).json({ message: "Producto no encontrado" })
    res.json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post("/api/productos", authMiddleware, async (req, res) => {
  const { nombre, sku, categoria, stock, precio, estado } = req.body
  let productEstado = estado
  if (!productEstado) {
    if (stock === 0) productEstado = "agotado"
    else if (stock < 10) productEstado = "bajo_stock"
    else productEstado = "en_stock"
  }
  try {
    const result = await dbAsync.run(
      "INSERT INTO productos (nombre, sku, categoria, stock, precio, estado) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, sku, categoria, stock, precio, productEstado]
    )
    const row = await dbAsync.get("SELECT * FROM productos WHERE id = ?", [result.lastID])
    res.status(201).json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.put("/api/productos/:id", authMiddleware, async (req, res) => {
  const { nombre, sku, categoria, stock, precio, estado } = req.body
  let productEstado = estado
  if (!productEstado) {
    if (stock === 0) productEstado = "agotado"
    else if (stock < 10) productEstado = "bajo_stock"
    else productEstado = "en_stock"
  }
  try {
    await dbAsync.run(
      "UPDATE productos SET nombre = ?, sku = ?, categoria = ?, stock = ?, precio = ?, estado = ? WHERE id = ?",
      [nombre, sku, categoria, stock, precio, productEstado, req.params.id]
    )
    const row = await dbAsync.get("SELECT * FROM productos WHERE id = ?", [req.params.id])
    res.json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete("/api/productos/:id", authMiddleware, async (req, res) => {
  try {
    await dbAsync.run("DELETE FROM productos WHERE id = ?", [req.params.id])
    res.json({ message: "Producto eliminado exitosamente" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get("/api/productos/stats/low-stock", authMiddleware, async (req, res) => {
  try {
    const rows = await dbAsync.all("SELECT * FROM productos WHERE stock < 10 AND stock > 0")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ============ VENTAS ROUTES ============
app.get("/api/ventas", authMiddleware, async (req, res) => {
  try {
    const rows = await dbAsync.all("SELECT * FROM ventas ORDER BY fecha DESC")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get("/api/ventas/:id", authMiddleware, async (req, res) => {
  try {
    const row = await dbAsync.get("SELECT * FROM ventas WHERE id = ?", [req.params.id])
    if (!row) return res.status(404).json({ message: "Venta no encontrada" })
    res.json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post("/api/ventas", authMiddleware, async (req, res) => {
  const { cliente_id, cliente, fecha, total, estado, metodo_pago, productos: productosVenta } = req.body
  try {
    const result = await dbAsync.run(
      "INSERT INTO ventas (cliente_id, cliente, fecha, total, estado, metodo_pago, productos) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [cliente_id, cliente, fecha || new Date().toISOString().split('T')[0], total, estado || "pendiente_pago", metodo_pago, productosVenta?.length || 0]
    )

    if (cliente_id) {
      await dbAsync.run(
        "UPDATE clientes SET pedidos = pedidos + 1, total_gastado = total_gastado + ? WHERE id = ?",
        [total, cliente_id]
      )
    }

    if (productosVenta && Array.isArray(productosVenta)) {
      for (const prod of productosVenta) {
        await dbAsync.run(
          "UPDATE productos SET stock = stock - ? WHERE id = ?",
          [prod.cantidad, prod.producto_id]
        )
      }
    }

    const row = await dbAsync.get("SELECT * FROM ventas WHERE id = ?", [result.lastID])
    res.status(201).json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.put("/api/ventas/:id", authMiddleware, async (req, res) => {
  const { cliente_id, cliente, fecha, total, estado, metodo_pago } = req.body
  try {
    await dbAsync.run(
      "UPDATE ventas SET cliente_id = ?, cliente = ?, fecha = ?, total = ?, estado = ?, metodo_pago = ? WHERE id = ?",
      [cliente_id, cliente, fecha, total, estado, metodo_pago, req.params.id]
    )
    const row = await dbAsync.get("SELECT * FROM ventas WHERE id = ?", [req.params.id])
    res.json(row)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete("/api/ventas/:id", authMiddleware, async (req, res) => {
  try {
    await dbAsync.run("DELETE FROM ventas WHERE id = ?", [req.params.id])
    res.json({ message: "Venta eliminada exitosamente" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get("/api/ventas/stats/summary", authMiddleware, async (req, res) => {
  try {
    const ventasTotal = await dbAsync.get("SELECT SUM(total) as total, COUNT(*) as count FROM ventas")
    const now = new Date()
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
    const currentYear = now.getFullYear()
    const ventasMes = await dbAsync.get(
      "SELECT SUM(total) as total FROM ventas WHERE strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?",
      [currentMonth, String(currentYear)]
    )
    const pedidosActivos = await dbAsync.get(
      "SELECT COUNT(*) as count FROM ventas WHERE estado IN ('en_proceso', 'pendiente_pago')"
    )

    res.json({
      ventasTotales: ventasTotal?.total || 0,
      numeroVentas: ventasTotal?.count || 0,
      ventasMes: ventasMes?.total || 0,
      pedidosActivos: pedidosActivos?.count || 0,
      ticketPromedio: ventasTotal?.total && ventasTotal?.count
        ? ventasTotal.total / ventasTotal.count
        : 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "BLACKRAIN ERP API" })
})

// Serve static frontend files
const frontendDistPath = path.join(__dirname, "../frontend/dist")
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath))
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"))
  })
}

// Initialize and start
const PORT = process.env.PORT || 5000

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor BLACKRAIN ERP corriendo en puerto ${PORT}`)
    console.log(`📁 Base de datos: ${DB_PATH}`)
    if (fs.existsSync(frontendDistPath)) {
      console.log(`🌐 Frontend servido desde: ${frontendDistPath}`)
    } else {
      console.log(`⚠️  No se encontró frontend/dist. Ejecuta 'npm run build' en la carpeta frontend.`)
    }
  })
}).catch(err => {
  console.error("❌ Error al inicializar la base de datos:", err)
  process.exit(1)
})

