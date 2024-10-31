import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL

interface Order {
  ordId: string;
  orderSituation: string;
  orderDate: string;
  custName: string;
}

interface Product {
  prodId: string;
  prodName: string;
  contCount: number;
}

export default function GatherPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // Updated state for products
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPermitting, setIsPermitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/gatheredexit`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrderDetails = async (ordId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/orderDetails/${ordId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setProducts(response.data.data); // Set product details from the response
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert('Failed to fetch order details. Please try again later.');
      }
    }
  };

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.ordId);
  };

  const handlePermit = async () => {
    if (!selectedOrder) return;
  
    try {
      setIsPermitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiUrl}/ordersc/${selectedOrder.ordId}`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
  
      if (response.data.success) {
        alert('سفارش تایید شد');
        setIsDialogOpen(false); 
        fetchOrders(); // Refresh the order list after successful permit
      } else {
        alert('Failed to permit the order');
      }
    } catch (error) {
      console.error('Error permitting order:', error);
      alert(error);
    } finally {
      setIsPermitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">درخواست ها</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card
            key={order.ordId}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(order)}
          >
            <CardHeader>
              <CardTitle>{order.custName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>شناسه سفارش:</strong> {order.ordId}
              </p>
              <p>
                <strong>وضعیت سفارش:</strong> {order.orderSituation}
              </p>
              <p>
                <strong>تاریخ:</strong> {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>جزییات سفارش</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div key={product.prodId} className="border-b pb-2">
                <p><strong>شناسه محصول:</strong> {product.prodId}</p>
                <p><strong>نام محصول:</strong> {product.prodName}</p>
                <p><strong>تعداد در کانتینر:</strong> {product.contCount}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-4">
            <Button onClick={() => setIsDialogOpen(false)}>بستن</Button>
            <Button
              onClick={handlePermit}
              disabled={isPermitting}
              className={isPermitting ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isPermitting ? 'در حال پردازش...' : 'تایید سفارش'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
