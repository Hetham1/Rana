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

interface OrderDetails {
  wspId: string;
  wspDirection: string;
  wspMaterial: string;
  wspType: number;
  wspPp: string;
  wspState: string;
  wspDate: string;
  wspIn: string;
  wspOut: string;
  wspLength: number;
  wspWempty: number;
  wspWfull: number;
  wspWpure: number;
  wspQC: number;
  wpId: string;
  wspLL: string;
  wspSector: string;
}

export default function GatherPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPermitting, setIsPermitting] = useState(false); // Track permit button state

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/gatheredexit`, {
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
      const response = await axios.get(`${BASE_URL}/uidDetails/wsp1`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setOrderDetails(response.data.data[0]);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        // Redirect to login page or refresh token
        // Example: window.location.href = '/login'
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
    if (!selectedOrder) return; // Ensure there is a selected order

    try {
      setIsPermitting(true); // Disable button while submitting
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/ordersc/${selectedOrder.ordId}`, // Use selectedOrder.ordId
        {}, // Empty data object for PUT request
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        alert('Order permitted successfully');
        setIsDialogOpen(false); // Close the pop-up after success
      } else {
        alert('Failed to permit the order');
      }
    } catch (error) {
      console.error('Error permitting order:', error);
      alert(error);
    } finally {
      setIsPermitting(false); // Re-enable button
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
                <strong>Order ID:</strong> {order.ordId}
              </p>
              <p>
                <strong>Situation:</strong> {order.orderSituation}
              </p>
              <p>
                <strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
              </p>
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
              <p>
                <strong>WSP ID:</strong> {orderDetails.wspId}
              </p>
              <p>
                <strong>Direction:</strong> {orderDetails.wspDirection}
              </p>
              <p>
                <strong>Material:</strong> {orderDetails.wspMaterial}
              </p>
              <p>
                <strong>Type:</strong> {orderDetails.wspType}
              </p>
              <p>
                <strong>PP:</strong> {orderDetails.wspPp}
              </p>
              <p>
                <strong>State:</strong> {orderDetails.wspState}
              </p>
              <p>
                <strong>Date:</strong> {orderDetails.wspDate}
              </p>
              <p>
                <strong>In:</strong> {orderDetails.wspIn}
              </p>
              <p>
                <strong>Out:</strong> {orderDetails.wspOut}
              </p>
              <p>
                <strong>Length:</strong> {orderDetails.wspLength}
              </p>
              <p>
                <strong>Empty Weight:</strong> {orderDetails.wspWempty}
              </p>
              <p>
                <strong>Full Weight:</strong> {orderDetails.wspWfull}
              </p>
              <p>
                <strong>Pure Weight:</strong> {orderDetails.wspWpure}
              </p>
              <p>
                <strong>QC:</strong> {orderDetails.wspQC}
              </p>
              <p>
                <strong>WP ID:</strong> {orderDetails.wpId}
              </p>
              <p>
                <strong>LL:</strong> {orderDetails.wspLL}
              </p>
              <p>
                <strong>Sector:</strong> {orderDetails.wspSector}
              </p>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-4">
            <Button onClick={() => setIsDialogOpen(false)}>بستن</Button>
            <Button
              onClick={handlePermit} // Fix function call here
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
