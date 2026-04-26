import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, X, FileDown, Download } from "lucide-react"
import axios from "axios"

const API_URL = "/api"

// Modal Component
function ProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: product?.nombre || "",
    sku: product?.sku || "",
    categoria: product?.categoria || "",
    stock: product?.stock || 0,
    precio: product?.precio || 0,
    estado: product?.estado || "en_stock"
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-erp-text">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          <button onClick={onClose} className="text-erp-text-muted hover:text-erp-text p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="input w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-erp-text-secondary mb-1">Categoría</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              className="input w-full"
            >
              <option value="">Seleccionar categoría</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Ropa">Ropa</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Hogar">Hogar</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="input w-full"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Precio Unitario</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value) || 0})}
                className="input w-full"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
              Cancelar
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteModal({ product, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <h3 className="text-lg font-semibold text-erp-text mb-2">Confirmar eliminación</h3>
        <p className="text-erp-text-secondary mb-6">
          ¿Estás seguro de eliminar el producto <strong>{product?.nombre}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className="bg-erp-danger text-white px-4 py-2 rounded-erp-sm hover:bg-erp-danger/80 transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Productos() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(`${API_URL}/productos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(res.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Calculate metrics
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.precio), 0)
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length
  const outOfStock = products.filter(p => p.stock === 0).length

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.categoria === categoryFilter
    const matchesStatus = !statusFilter || product.estado === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  // CRUD Operations
  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem("token")
      if (editingProduct) {
        await axios.put(`${API_URL}/productos/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`${API_URL}/productos`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      fetchProducts()
      setShowModal(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar el producto")
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_URL}/productos/${deletingProduct.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchProducts()
      setShowDeleteModal(false)
      setDeletingProduct(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error al eliminar el producto")
    }
  }

  const downloadProductoPDF = (productId) => {
    const token = localStorage.getItem("token")
    window.open(`${API_URL}/productos/${productId}/pdf?token=${token}`, "_blank")
  }

  const downloadProductosCSV = () => {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'sku', label: 'SKU' },
      { key: 'categoria', label: 'Categoria' },
      { key: 'stock', label: 'Stock' },
      { key: 'precio', label: 'Precio' },
      { key: 'estado', label: 'Estado' }
    ]
    const rows = filteredProducts.map(p => ({
      ...p,
      precio: `$${parseFloat(p.precio || 0).toLocaleString()}`,
      estado: p.stock === 0 ? 'Agotado' : p.stock < 10 ? 'Bajo stock' : 'En stock'
    }))
    const csv = [
      headers.map(h => h.label).join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h.key] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (product) => {
    if (product.stock === 0) {
      return <span className="badge badge-danger">Agotado</span>
    } else if (product.stock < 10) {
      return <span className="badge badge-warning">Bajo stock</span>
    }
    return <span className="badge badge-success">En stock</span>
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-hover animate-fadeIn">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-gold/10 rounded-erp-sm">
              <Package size={18} sm:size={20} className="text-erp-gold" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Total Productos</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{totalProducts}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-success/10 rounded-erp-sm">
              <Package size={18} sm:size={20} className="text-erp-success" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Valor Stock</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">${totalValue.toLocaleString()}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-warning/10 rounded-erp-sm">
              <AlertTriangle size={18} sm:size={20} className="text-erp-warning" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Stock Bajo</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{lowStock}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-danger/10 rounded-erp-sm">
              <Package size={18} sm:size={20} className="text-erp-danger" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Agotados</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{outOfStock}</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-erp-text-muted" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input py-2.5 w-full sm:w-auto"
            >
              <option value="">Todas las categorías</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Ropa">Ropa</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Hogar">Hogar</option>
              <option value="Otros">Otros</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-2.5 w-full sm:w-auto"
            >
              <option value="">Todos los estados</option>
              <option value="en_stock">En stock</option>
              <option value="bajo_stock">Bajo stock</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setEditingProduct(null)
                setShowModal(true)
              }}
              className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Plus size={18} />
              Nuevo Producto
            </button>
            <button
              onClick={downloadProductosCSV}
              className="btn-secondary flex items-center justify-center gap-2 p-2.5"
              title="Descargar CSV"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table min-w-[700px]">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th className="hidden sm:table-cell">Categoría</th>
                  <th>Stock</th>
                  <th className="hidden md:table-cell">Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-erp-text-muted">
                      Cargando productos...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-erp-text-muted">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="font-medium">{product.nombre}</td>
                      <td className="text-erp-gold">{product.sku}</td>
                      <td className="text-erp-text-secondary hidden sm:table-cell">{product.categoria || "-"}</td>
                      <td>{product.stock}</td>
                      <td className="font-semibold hidden md:table-cell">${parseFloat(product.precio).toLocaleString()}</td>
                      <td>{getStatusBadge(product)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => downloadProductoPDF(product.id)}
                            className="p-2 text-erp-text-secondary hover:text-erp-info hover:bg-erp-info/10 rounded-erp-sm transition-colors"
                            title="Descargar ficha PDF"
                          >
                            <FileDown size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(product)
                              setShowModal(true)
                            }}
                            className="p-2 text-erp-text-secondary hover:text-erp-gold hover:bg-erp-gold/10 rounded-erp-sm transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingProduct(product)
                              setShowDeleteModal(true)
                            }}
                            className="p-2 text-erp-text-secondary hover:text-erp-danger hover:bg-erp-danger/10 rounded-erp-sm transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
          }}
          onSave={handleSave}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          product={deletingProduct}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingProduct(null)
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

