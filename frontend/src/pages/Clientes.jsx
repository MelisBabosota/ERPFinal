import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Users, UserPlus, Crown, UserX, X, FileDown, Download } from "lucide-react"
import axios from "axios"

const API_URL = "/api"

// Componente modal
function ClientModal({ client, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: client?.nombre || "",
    email: client?.email || "",
    telefono: client?.telefono || "",
    direccion: client?.direccion || "",
    tipo: client?.tipo || "regular",
    estado: client?.estado || "activo"
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
            {client ? "Editar Cliente" : "Registrar Cliente"}
          </h3>
          <button onClick={onClose} className="text-erp-text-muted hover:text-erp-text p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-erp-text-secondary mb-1">Nombre completo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Correo electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-erp-text-secondary mb-1">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="input w-full"
              >
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
                <option value="mayorista">Mayorista</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-erp-text-secondary mb-1">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="input w-full"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
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

// Modal de confirmación de eliminación
function DeleteModal({ client, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <h3 className="text-lg font-semibold text-erp-text mb-2">Confirmar eliminación</h3>
        <p className="text-erp-text-secondary mb-6">
          ¿Estás seguro de eliminar al cliente <strong>{client?.nombre}</strong>? Esta acción no se puede deshacer.
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

export default function Clientes() {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [deletingClient, setDeletingClient] = useState(null)
  const [loading, setLoading] = useState(true)

  // Obtener clientes
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(`${API_URL}/clientes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClients(res.data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // Calcular métricas
  const totalClients = clients.length
  const newClients = clients.filter(c => {
    const createdDate = new Date(c.created_at)
    const now = new Date()
    const thisMonth = createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
    return thisMonth
  }).length
  const vipClients = clients.filter(c => c.tipo === "vip").length
  const activeClients = clients.filter(c => c.estado === "activo").length
  const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || client.tipo === typeFilter
    const matchesStatus = !statusFilter || client.estado === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // Operaciones CRUD
  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem("token")
      if (editingClient) {
        await axios.put(`${API_URL}/clientes/${editingClient.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`${API_URL}/clientes`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      fetchClients()
      setShowModal(false)
      setEditingClient(null)
    } catch (error) {
      console.error("Error saving client:", error)
      alert("Error al guardar el cliente")
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_URL}/clientes/${deletingClient.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchClients()
      setShowDeleteModal(false)
      setDeletingClient(null)
    } catch (error) {
      console.error("Error deleting client:", error)
      alert("Error al eliminar el cliente")
    }
  }

  const downloadClientePDF = (clientId) => {
    const token = localStorage.getItem("token")
    window.open(`${API_URL}/clientes/${clientId}/pdf?token=${token}`, "_blank")
  }

  const downloadClientesCSV = () => {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'telefono', label: 'Telefono' },
      { key: 'direccion', label: 'Direccion' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'estado', label: 'Estado' },
      { key: 'pedidos', label: 'Pedidos' },
      { key: 'total_gastado', label: 'Total Gastado' }
    ]
    const rows = filteredClients.map(c => ({
      ...c,
      tipo: c.tipo === 'vip' ? 'VIP' : c.tipo === 'mayorista' ? 'Mayorista' : 'Regular',
      estado: c.estado === 'activo' ? 'Activo' : 'Inactivo',
      total_gastado: `$${(c.total_gastado || 0).toLocaleString()}`
    }))
    const csv = [
      headers.map(h => h.label).join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h.key] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (client) => {
    if (client.tipo === "vip") {
      return <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">VIP</span>
    }
    if (client.estado === "inactivo") {
      return <span className="badge badge-danger">Inactivo</span>
    }
    return <span className="badge badge-success">Activo</span>
  }

  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500"
    ]
    const index = name?.charCodeAt(0) % colors.length || 0
    return colors[index]
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-hover animate-fadeIn">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-gold/10 rounded-erp-sm">
              <Users size={18} sm:size={20} className="text-erp-gold" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Total Clientes</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{totalClients}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-success/10 rounded-erp-sm">
              <UserPlus size={18} sm:size={20} className="text-erp-success" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Nuevos (mes)</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{newClients}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-500/10 rounded-erp-sm">
              <Crown size={18} sm:size={20} className="text-purple-400" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Clientes VIP</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{vipClients}</p>
        </div>

        <div className="card-hover animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-erp-info/10 rounded-erp-sm">
              <Users size={18} sm:size={20} className="text-erp-info" />
            </div>
          </div>
          <h3 className="text-erp-text-secondary text-sm">Retención</h3>
          <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{retentionRate}%</p>
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
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input py-2.5 w-full sm:w-auto"
            >
              <option value="">Todos los tipos</option>
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
              <option value="mayorista">Mayorista</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-2.5 w-full sm:w-auto"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setEditingClient(null)
                setShowModal(true)
              }}
              className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Plus size={18} />
              Registrar Cliente
            </button>
            <button
              onClick={downloadClientesCSV}
              className="btn-secondary flex items-center justify-center gap-2 p-2.5"
              title="Descargar CSV"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table min-w-[800px]">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th className="hidden sm:table-cell">ID</th>
                  <th>Contacto</th>
                  <th className="hidden md:table-cell">Ubicación</th>
                  <th className="hidden lg:table-cell">Pedidos</th>
                  <th className="hidden lg:table-cell">Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-erp-text-muted">
                      Cargando clientes...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-erp-text-muted">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full ${getAvatarColor(client.nombre)} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                            {client.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium truncate max-w-[120px] sm:max-w-none">{client.nombre}</span>
                        </div>
                      </td>
                      <td className="text-erp-text-muted hidden sm:table-cell">#{client.id}</td>
                      <td>
                        <div className="min-w-0">
                          <p className="text-sm truncate max-w-[120px]">{client.email}</p>
                          <p className="text-xs text-erp-text-muted hidden sm:block">{client.telefono || "-"}</p>
                        </div>
                      </td>
                      <td className="text-erp-text-secondary hidden md:table-cell">{client.direccion || "-"}</td>
                      <td className="hidden lg:table-cell">{client.pedidos || 0}</td>
                      <td className="font-semibold hidden lg:table-cell">${(client.total_gastado || 0).toLocaleString()}</td>
                      <td>{getStatusBadge(client)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => downloadClientePDF(client.id)}
                            className="p-2 text-erp-text-secondary hover:text-erp-info hover:bg-erp-info/10 rounded-erp-sm transition-colors"
                            title="Descargar registro PDF"
                          >
                            <FileDown size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingClient(client)
                              setShowModal(true)
                            }}
                            className="p-2 text-erp-text-secondary hover:text-erp-gold hover:bg-erp-gold/10 rounded-erp-sm transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingClient(client)
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

      {/* Modales */}
      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => {
            setShowModal(false)
            setEditingClient(null)
          }}
          onSave={handleSave}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          client={deletingClient}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingClient(null)
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

