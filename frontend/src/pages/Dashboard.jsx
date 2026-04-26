import { useNavigate } from "react-router-dom"
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, ShoppingCart, Package, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"

// Datos de ejemplo
const metricCards = [
  { title: "Ingresos hoy", value: "$185,420", change: "+12.5%", positive: true, icon: DollarSign },
  { title: "Pedidos abiertos", value: "47", change: "+8.2%", positive: true, icon: ShoppingCart },
  { title: "Inventario bajo", value: "23 ítems", change: "-3.1%", positive: false, icon: Package },
  { title: "Facturas vencidas", value: "19", change: "+15.0%", positive: false, icon: FileText },
]

const recentOrders = [
  { id: "PED-001", client: "Juan Pérez", date: "14/01/2025", amount: "$15,400", status: "en_proceso" },
  { id: "PED-002", client: "María García", date: "14/01/2025", amount: "$8,750", status: "facturado" },
  { id: "PED-003", client: "Carlos López", date: "13/01/2025", amount: "$22,300", status: "retrasado" },
  { id: "PED-004", client: "Ana Martínez", date: "13/01/2025", amount: "$5,200", status: "en_proceso" },
  { id: "PED-005", client: "Pedro Sánchez", date: "12/01/2025", amount: "$18,900", status: "facturado" },
]

const weeklyData = [
  { day: "Lun", orders: 45 },
  { day: "Mar", orders: 52 },
  { day: "Mié", orders: 38 },
  { day: "Jue", orders: 61 },
  { day: "Vie", orders: 55 },
  { day: "Sáb", orders: 32 },
  { day: "Dom", orders: 28 },
]

const pendingTasks = [
  { id: 1, title: "Aprobar pedido PED-001", priority: "high", time: "Hace 2 horas" },
  { id: 2, title: "Revisar inventario bajo", priority: "medium", time: "Hace 4 horas" },
  { id: 3, title: "Actualizar precios", priority: "low", time: "Hace 1 día" },
  { id: 4, title: "Generar informe mensual", priority: "medium", time: "Hace 1 día" },
]

const inventoryAlerts = [
  { id: 1, product: "Producto A", current: 5, min: 10 },
  { id: 2, product: "Producto B", current: 3, min: 15 },
  { id: 3, product: "Producto C", current: 8, min: 20 },
]

// Datos para Evaluación de pedidos - gráficas de barras
const evaluacionPedidos = [
  { mes: "Ene", pedidos: 120, completados: 98, cancelados: 8 },
  { mes: "Feb", pedidos: 145, completados: 130, cancelados: 5 },
  { mes: "Mar", pedidos: 132, completados: 115, cancelados: 12 },
  { mes: "Abr", pedidos: 168, completados: 150, cancelados: 6 },
  { mes: "May", pedidos: 155, completados: 140, cancelados: 9 },
  { mes: "Jun", pedidos: 190, completados: 175, cancelados: 7 },
]

const statusPedidos = [
  { estado: "En proceso", cantidad: 47, color: "bg-erp-warning" },
  { estado: "Entregados", cantidad: 312, color: "bg-erp-success" },
  { estado: "Pendientes", cantidad: 28, color: "bg-erp-info" },
  { estado: "Cancelados", cantidad: 15, color: "bg-erp-danger" },
]

const maxPedidosMes = Math.max(...evaluacionPedidos.map(d => d.pedidos))
const maxStatus = Math.max(...statusPedidos.map(d => d.cantidad))

const getStatusBadge = (status) => {
  const statusMap = {
    en_proceso: { label: "En proceso", class: "badge-warning" },
    facturado: { label: "Facturado", class: "badge-success" },
    retrasado: { label: "Retrasado", class: "badge-danger" },
  }
  const s = statusMap[status] || statusMap.en_proceso
  return <span className={s.class}>{s.label}</span>
}

const maxOrders = Math.max(...weeklyData.map(d => d.orders))

export default function Dashboard() {
  const navigate = useNavigate()

  // Datos para la gráfica de pastel
  const totalPedidos = statusPedidos.reduce((sum, s) => sum + s.cantidad, 0)
  let acumulado = 0
  const pastelSlices = statusPedidos.map((item) => {
    const porcentaje = item.cantidad / totalPedidos
    const startAngle = acumulado * 360
    acumulado += porcentaje
    const endAngle = acumulado * 360
    return { ...item, porcentaje, startAngle, endAngle }
  })

  const gradientColors = {
    "bg-erp-warning": "#f59e0b",
    "bg-erp-success": "#10b981",
    "bg-erp-info": "#3b82f6",
    "bg-erp-danger": "#ef4444",
  }

  const conicGradient = `conic-gradient(${pastelSlices
    .map((s) => `${gradientColors[s.color]} ${s.startAngle}deg ${s.endAngle}deg`)
    .join(", ")})`

  return (
    <div className="space-y-6">
      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <div 
            key={index}
            className="card-hover animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 bg-erp-gold/10 rounded-erp-sm">
                <card.icon size={18} sm:size={20} className="text-erp-gold" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${card.positive ? 'text-erp-success' : 'text-erp-danger'}`}>
                {card.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.change}
              </div>
            </div>
            <h3 className="text-erp-text-secondary text-sm">{card.title}</h3>
            <p className="text-xl sm:text-2xl font-bold text-erp-text mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Grid de contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pedidos recientes y gráfica */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabla de pedidos recientes */}
          <div className="card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-erp-text">Pedidos recientes</h3>
              <button className="text-sm text-erp-gold hover:text-erp-gold-hover self-start sm:self-auto">
                Ver todos
              </button>
            </div>
            <div className="table-container">
              <div className="overflow-x-auto">
                <table className="table min-w-[600px]">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Pedido</th>
                      <th>Fecha</th>
                      <th className="hidden sm:table-cell">Importe</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-medium">{order.client}</td>
                        <td className="text-erp-gold">{order.id}</td>
                        <td className="text-erp-text-secondary">{order.date}</td>
                        <td className="font-semibold hidden sm:table-cell">{order.amount}</td>
                        <td>{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Evaluación de pedidos - Gráfica de pastel */}
          <div className="card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg font-semibold text-erp-text">Evaluación de pedidos</h3>
              <TrendingUp size={18} sm:size={20} className="text-erp-gold" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Gráfica de pastel */}
              <div className="relative w-40 h-40 sm:w-52 sm:h-52 flex-shrink-0">
                <div
                  className="w-full h-full rounded-full"
                  style={{ background: conicGradient }}
                ></div>
                {/* Centro blanco para efecto donut */}
                <div className="absolute inset-0 m-auto w-24 h-24 sm:w-32 sm:h-32 bg-erp-card rounded-full flex flex-col items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-erp-text">{totalPedidos}</span>
                  <span className="text-[10px] sm:text-xs text-erp-text-secondary">Total</span>
                </div>
              </div>

              {/* Leyenda */}
              <div className="flex-1 w-full">
                <div className="space-y-3">
                  {pastelSlices.map((slice, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: gradientColors[slice.color] }}
                        ></div>
                        <span className="text-sm text-erp-text">{slice.estado}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-erp-text">{slice.cantidad}</span>
                        <span className="text-xs text-erp-text-secondary w-12 text-right">
                          {Math.round(slice.porcentaje * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral derecho */}
        <div className="space-y-6">
          {/* Tareas pendientes */}
          <div className="card animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-lg font-semibold text-erp-text mb-4">Tareas pendientes</h3>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-erp-bg rounded-erp-sm hover:bg-erp-card-hover transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-erp-danger' : 
                    task.priority === 'medium' ? 'bg-erp-warning' : 'bg-erp-text-muted'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-erp-text truncate">{task.title}</p>
                    <p className="text-xs text-erp-text-muted mt-1">{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas de inventario */}
          <div className="card animate-fadeIn" style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-erp-warning" />
              <h3 className="text-lg font-semibold text-erp-text">Alertas</h3>
            </div>
            <div className="space-y-3">
              {inventoryAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-erp-danger/5 border border-erp-danger/20 rounded-erp-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-erp-text font-medium truncate">{alert.product}</p>
                    <p className="text-xs text-erp-text-muted">Stock: {alert.current} / Mín: {alert.min}</p>
                  </div>
                  <Package size={18} className="text-erp-danger flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/productos')}
              className="w-full mt-4 btn-secondary text-sm"
            >
              Ver inventario
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

