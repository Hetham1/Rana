import { useEffect, useState } from "react";
import { CalendarDays, PackageCheck, PackageOpen, UserRound } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, WorkflowHeader } from "@/components/workflow";

interface Order { ordId: string; orderSituation: string; orderDate: string; custName: string; }
interface Product { prodId: string; prodName: string; contCount: number; }

export default function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [permitting, setPermitting] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await api.get(`${apiBaseUrl}/gatheredexit`);
      setOrders(response.data.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت سفارش‌های آماده خروج ناموفق بود"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchOrders(); }, []);

  async function openOrder(order: Order) {
    try {
      const response = await api.get(`${apiBaseUrl}/orderDetails/${order.ordId}`);
      if (response.data.data === "no") return toast.warning("این سفارش فاقد ردیف محصول است");
      setProducts(response.data.data);
      setSelectedOrder(order);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت جزئیات سفارش ناموفق بود"));
    }
  }

  async function permitOrder() {
    if (!selectedOrder) return;
    setPermitting(true);
    try {
      await api.put(`${apiBaseUrl}/ordersc/${selectedOrder.ordId}`, {});
      toast.success("سفارش برای خروج تایید شد", { description: `شناسه ${selectedOrder.ordId}` });
      setSelectedOrder(null);
      await fetchOrders();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تایید سفارش انجام نشد"));
    } finally {
      setPermitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <WorkflowHeader icon={PackageCheck} eyebrow="صف کنترل حراست" title="سفارش‌های آماده خروج" description="جزئیات هر سفارش را بررسی و مجوز مرحله بعد را ثبت کنید." />
      {loading ? <div className="grid min-h-64 place-items-center"><div className="route-progress" /></div> : orders.length === 0 ? (
        <EmptyState icon={PackageOpen} title="سفارشی در صف نیست" description="سفارش‌های تجمیع‌شده در این بخش نمایش داده می‌شوند." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <button key={order.ordId} type="button" onClick={() => void openOrder(order)} className="workflow-card p-5 text-right hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-blue-700">{order.ordId}</p><h3 className="mt-1 font-bold text-slate-900">{order.custName || "مشتری ثبت‌شده"}</h3></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">آماده بررسی</span></div>
              <div className="mt-5 grid gap-2 text-sm text-slate-500"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(order.orderDate).toLocaleDateString("fa-IR")}</p><p className="flex items-center gap-2"><UserRound className="h-4 w-4" />برای مشاهده اقلام کلیک کنید</p></div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader><DialogTitle className="text-right">جزئیات سفارش {selectedOrder?.ordId}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">{products.map((product) => <div key={product.prodId} className="rounded-xl border bg-slate-50 p-4"><p className="text-xs text-slate-400">{product.prodId}</p><strong className="mt-1 block text-slate-800">{product.prodName}</strong><p className="mt-2 text-sm text-slate-500">تعداد: {product.contCount.toLocaleString("fa-IR")}</p></div>)}</div>
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => setSelectedOrder(null)}>بستن</Button><Button onClick={() => void permitOrder()} disabled={permitting}>{permitting ? "در حال ثبت…" : "تایید خروج سفارش"}</Button></div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
