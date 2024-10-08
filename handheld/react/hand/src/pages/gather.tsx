import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axios from 'axios';

import { BASE_URL } from '../hooks/apiconfig';

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // This is correct
  const [orderDetails, setOrderDetails] = useState<Product[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/order?userId=${userId}`, {
        headers: {
          'Authorization': `${token}`,
        },
      });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrderDetails = async (ordId: string) => {
    try {
      console.log(selectedOrder)
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/orderDetails/${ordId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setOrderDetails(response.data.data); // Assuming response.data.data is an array of products
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
    setSelectedOrder(order); // Set the selected order
    fetchOrderDetails(order.ordId);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">سفارشات</h1>
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
                <strong>وضعیت:</strong> {order.orderSituation}
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
            <AlertDialogTitle className='text-center'>جزییات سفارش</AlertDialogTitle>
          </AlertDialogHeader>
          {orderDetails && (
            <div className="grid grid-cols-2 gap-4">
              {orderDetails.map((product) => (
                <div key={product.prodId} className="col-span-2">
                  <p>
                    <strong>شناسه محصول:</strong> {product.prodId}
                  </p>
                  <p>
                    <strong>نام محصول:</strong> {product.prodName}
                  </p>
                  <p>
                    <strong>تعداد کانتینر:</strong> {product.contCount}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Button onClick={() => setIsDialogOpen(false)} className="mt-4">
            بستن
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
