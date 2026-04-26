import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, DollarSign, ShoppingCart, Receipt, RotateCcw, X, Filter, FileDown, Download } from "lucide-react"
import axios from "axios"

const API_URL = "/api"

// Modal para crear/editar venta
function VentaModal({ venta, clientes, onClose, onSave }) {
  const [formData, setFormData] = useState({
    cliente_id: venta?.cliente_id || "",
    cliente: venta?.cliente || "",
    fecha: venta?.fecha || new Date().toISOString().split('T')[0],
    total: venta?.total || 0,
    estado: venta?.estado || "pendiente_pago",
    metodo_pago: venta?.metodo_pago || "Efectivo",
    productos: venta?.productos || 0
  })

  // Actualizar nombre del cliente cuando se selecciona uno
  const handleClienteChange = (e) => {
    const clienteId = e.target.value
    const selectedCliente = clientes.find(c => c.id === parseInt(clienteId))
    setFormData({
      ...formData,
      cliente_id: clienteId,
      cliente: selectedCliente ? selectedCliente.nombre : ""
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-erp-text">
            {venta ? "Editar Venta" : "Nueva Venta"}
          </h3>
          <button onClick={onClose} className="text-erp-text-muted hover:text-erp-text p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-erp-text-secondary mb-1">Cliente</label>
            <select
              value={formData.cliente_id}
              onChange={handleClienteChange}
              className="input w-full"
              required
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Total ($)</label>
              <input
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({...formData, total: parseFloat(e.target.value) || 0})}
                className="input w-full"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="input w-full"
              >
                <option value="en_proceso">En Proceso</option>
                <option value="pendiente_pago">Pendiente Pago</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Método de Pago</label>
              <select
                value={formData.metodo_pago}
                onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                className="input w-full"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-erp-text-secondary mb-1">Número de Productos</label>
            <input
              type="number"
              value={formData.productos}
              onChange={(e) => setFormData({...formData, productos: parseInt(e.target.value) || 0})}
              className="input w-full"
              min="0"
            />
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

// Modal para confirmar eliminación
function DeleteModal({ venta, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <h3 className="text-lg font-semibold text-erp-text mb-2">Confirmar eliminación</h3>
        <p className="text-erp-text-secondary mb-6">
          ¿Estás seguro de eliminar la venta de <strong>{venta?.cliente}</strong> por <strong>${parseFloat(venta?.total || 0).toLocaleString()}</strong>? Esta acción no se puede deshacer.
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

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingVenta, setEditingVenta] = useState(null)
  const [deletingVenta, setDeletingVenta] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  // Cargar ventas reales desde la API
  const fetchVentas = async () => {
    try {
      const res = await axios.get(`${API_URL}/ventas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVentas(res.data)
    } catch (error) {
      console.error("Error cargando ventas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes reales para el selector
  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClientes(res.data)
    } catch (error) {
      console.error("Error cargando clientes:", error)
    }
  }

  useEffect(() => {
    fetchVentas()
    fetchClientes()
  }, [])

  // Calcular métricas a partir de datos reales
  const totalVentas = ventas.length
  const ventasActivas = ventas.filter(v => v.estado === "en_proceso" || v.estado === "pendiente_pago").length
  const ventasTotalesMonto = ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0)
  const ticketPromedio = totalVentas > 0 ? ventasTotalesMonto / totalVentas : 0
  const devoluciones = ventas.filter(v => v.estado === "cancelado").length
  const porcentajeDevoluciones = totalVentas > 0 ? (devoluciones / totalVentas) * 100 : 0

  // Métricas del mes actual
  const ahora = new Date()
  const mesActual = ahora.getMonth()
  const anoActual = ahora.getFullYear()
  const ventasMes = ventas.filter(v => {
    const fecha = new Date(v.fecha)
    return fecha.getMonth() === mesActual && fecha.getFullYear() === anoActual
  })
  const montoMes = ventasMes.reduce((sum, v) => sum + parseFloat(v.total || 0), 0)

  // Filtrar ventas
  const filteredVentas = ventas.filter(venta => {
    const matchesSearch = venta.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venta.id?.toString().includes(searchTerm)
    const matchesStatus = !statusFilter || venta.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  // Guardar venta (crear o editar)
  const handleSave = async (formData) => {
    try {
      if (editingVenta) {
        await axios.put(`${API_URL}/ventas/${editingVenta.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`${API_URL}/ventas`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      fetchVentas() // Recargar datos desde la base de datos
      setShowModal(false)
      setEditingVenta(null)
    } catch (error) {
      console.error("Error guardando venta:", error)
      alert("Error al guardar la venta")
    }
  }

  // Eliminar venta
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/ventas/${deletingVenta.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchVentas() // Recargar datos desde la base de datos
      setShowDeleteModal(false)
      setDeletingVenta(null)
    } catch (error) {
      console.error("Error eliminando venta:", error)
      alert("Error al eliminar la venta")
    }
  }

  const downloadVentaPDF = (ventaId) => {
    const token = localStorage.getItem("token")
    window.open(`${API_URL}/ventas/${ventaId}/pdf?token=${token}`, "_blank")
  }

  const downloadVentasCSV = () => {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'cliente', label: 'Cliente' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'total', label: 'Total' },
      { key: 'estado', label: 'Estado' },
      { key: 'metodo_pago', label: 'Metodo Pago' },
      { key: 'productos', label: 'Productos' }
    ]
    const rows = filteredVentas.map(v => ({
      ...v,
      total: `$${parseFloat(v.total || 0).toLocaleString()}`,
      estado: v.estado === 'en_proceso' ? 'En Proceso' :
              v.estado === 'pendiente_pago' ? 'Pendiente Pago' :
              v.estado === 'entregado' ? 'Entregado' :
              v.estado === 'cancelado' ? 'Cancelado' : v.estado
    }))
    const csv = [
      headers.map(h => h.label).join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h.key] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ventas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      en_proceso: { label: "En Proceso", class: "badge-warning" },
      pendiente_pago: { label: "Pendiente Pago", class: "bg-orange-500/20 text-orange-400 border border-orange-500/30" },
      entregado: { label: "Entregado", class: "badge-success" },
      cancelado: { label: "Cancelado", class: "badge-danger" },
    }
    const s = statusMap[status] || statusMap.en_proceso
    return <span className={`badge ${s.class}`}>{s.label}</span>
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-hover animate-fadeIn">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-gold/10 rounded-erp-sm">
              <DollarSign size={18} className="text-erp-gold" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Ventas Mensuales</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">${montoMes.toLocaleString()}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-success/10 rounded-erp-sm">
              <ShoppingCart size={18} className="text-erp-success" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Pedidos Activos</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{ventasActivas}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-info/10 rounded-erp-sm">
              <Receipt size={18} className="text-erp-info" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Ticket Promedio</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">${Math.round(ticketPromedio).toLocaleString()}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-danger/10 rounded-erp-sm">
              <RotateCcw size={18} className="text-erp-danger" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Cancelaciones</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{porcentajeDevoluciones.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filtros y acciones */}
      <div className="card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-erp-text-muted" size={18} />
              <input
                type="text"
                placeholder="Buscar cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={18} className="text-erp-text-muted flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input py-2.5 w-full sm:w-auto min-w-[120px]"
              >
                <option value="">Todos los estados</option>
                <option value="en_proceso">En Proceso</option>
                <option value="pendiente_pago">Pendiente Pago</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setEditingVenta(null)
                setShowModal(true)
              }}
              className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap flex-1 sm:flex-none"
            >
              <Plus size={18} />
              <span className="sm:hidden lg:inline">Crear</span> Pedido
            </button>
            <button
              onClick={downloadVentasCSV}
              className="btn-secondary flex items-center justify-center gap-2 p-2.5"
              title="Descargar CSV"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table min-w-[800px]">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th className="hidden md:table-cell">Método pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-erp-text-muted">
                      Cargando ventas...
                    </td>
                  </tr>
                ) : filteredVentas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-erp-text-muted">
                      No se encontraron ventas
                    </td>
                  </tr>
                ) : (
                  filteredVentas.map((venta) => (
                    <tr key={venta.id}>
                      <td className="font-medium text-erp-gold">#{venta.id}</td>
                      <td className="font-medium">{venta.cliente}</td>
                      <td className="text-erp-text-secondary whitespace-nowrap">{formatDate(venta.fecha)}</td>
                      <td className="font-semibold">${parseFloat(venta.total || 0).toLocaleString()}</td>
                      <td>{getStatusBadge(venta.estado)}</td>
                      <td className="text-erp-text-secondary hidden md:table-cell">{venta.metodo_pago}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => downloadVentaPDF(venta.id)}
                            className="p-2 text-erp-text-secondary hover:text-erp-info hover:bg-erp-info/10 rounded-erp-sm transition-colors"
                            title="Descargar comprobante PDF"
                          >
                            <FileDown size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingVenta(venta)
                              setShowModal(true)
                            }}
                            className="p-2 text-erp-text-secondary hover:text-erp-gold hover:bg-erp-gold/10 rounded-erp-sm transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingVenta(venta)
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

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-erp-border">
          <p className="text-sm text-erp-text-secondary order-2 sm:order-1">
            Mostrando {filteredVentas.length} de {ventas.length} ventas
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button className="btn-secondary py-1.5 px-3 text-sm" disabled>
              Anterior
            </button>
            <button className="btn-secondary py-1.5 px-3 text-sm">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showModal && (
        <VentaModal
          venta={editingVenta}
          clientes={clientes}
          onClose={() => {
            setShowModal(false)
            setEditingVenta(null)
          }}
          onSave={handleSave}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          venta={deletingVenta}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingVenta(null)
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

