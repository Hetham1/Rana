import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import axios from 'axios'


import { BASE_URL } from '../hooks/apiconfig';
interface Order {
  ordId: string
  orderSituation: string
  orderDate: string
  custName: string
}


interface OrderDetails {
  wspId: string
  wspDirection: string
  wspMaterial: string
  wspType: number
  wspPp: string
  wspState: string
  wspDate: string
  wspIn: string
  wspOut: string
  wspLength: number
  wspWempty: number
  wspWfull: number
  wspWpure: number
  wspQC: number
  wpId: string
  wspLL: string
  wspSector: string
}

export default function GatherPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BASE_URL}/order?userId=${userId}`, {
        headers: {
          'Authorization': `${token}`
        }
      })
      setOrders(response.data.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchOrderDetails = async (ordId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BASE_URL}/orderDetails/${ordId}`, {
        headers: {
          'Authorization': `${token}`
        }
      })
      setOrderDetails(response.data.data[0])
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert("Your session has expired. Please log in again.")
       
      } else {
        alert("Failed to fetch order details. Please try again later.")
      }
    }
  }

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order)
    fetchOrderDetails(order.ordId)
    console.log(selectedOrder)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">سفارشات</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card key={order.ordId} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick(order)}>
            <CardHeader>
              <CardTitle>{order.custName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>شناسه سفارش:</strong> {order.ordId}</p>
              <p><strong>وضعیت:</strong> {order.orderSituation}</p>
              <p><strong>تاریخ:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Order Details</AlertDialogTitle>
          </AlertDialogHeader>
          {orderDetails && (
            <div className="grid grid-cols-2 gap-4">
              <p><strong>شناسه:</strong> {orderDetails.wspId}</p>
              <p><strong>جهت:</strong> {orderDetails.wspDirection}</p>
              <p><strong>مواد:</strong> {orderDetails.wspMaterial}</p>
              <p><strong>نوع:</strong> {orderDetails.wspType}</p>
              <p><strong>PP:</strong> {orderDetails.wspPp}</p>
              <p><strong>وضعیت:</strong> {orderDetails.wspState}</p>
              <p><strong>تاریخ:</strong> {orderDetails.wspDate}</p>
              <p><strong>ورود:</strong> {orderDetails.wspIn}</p>
              <p><strong>خروج:</strong> {orderDetails.wspOut}</p>
              <p><strong>طول:</strong> {orderDetails.wspLength}</p>
              <p><strong>وزن خالی:</strong> {orderDetails.wspWempty}</p>
              <p><strong>وزن کامل:</strong> {orderDetails.wspWfull}</p>
              <p><strong>وزن خالص:</strong> {orderDetails.wspWpure}</p>
              <p><strong>کنترل کیفیت:</strong> {orderDetails.wspQC}</p>
              <p><strong>شناسه WP:</strong> {orderDetails.wpId}</p>
              <p><strong>LL:</strong> {orderDetails.wspLL}</p>
              <p><strong>بخش:</strong> {orderDetails.wspSector}</p>

            </div>
          )}
          <Button onClick={() => setIsDialogOpen(false)} className="mt-4">بستن</Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}