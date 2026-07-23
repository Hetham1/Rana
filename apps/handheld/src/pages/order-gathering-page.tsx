import { useEffect, useMemo, useState } from "react";
import { CalendarDays, PackageOpen, Search, ShoppingBasket } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, WorkflowHeader } from "@/components/workflow";

interface Order { ordId: string; orderSituation: string; orderDate: string; custName: string; }
interface Product { prodId: string; prodName: string; contCount: number; }

export default function OrderGatheringPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`${apiBaseUrl}/order`).then((response) => setOrders(response.data.data)).catch((error) => toast.error(getApiErrorMessage(error, "دریافت سفارش‌ها ناموفق بود"))).finally(() => setLoading(false));
  }, []);

  const visibleOrders = useMemo(() => orders.filter((order) => `${order.ordId} ${order.custName}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);

  async function openOrder(order: Order) {
    try {
      const response = await api.get(`${apiBaseUrl}/orderDetails/${order.ordId}`);
      if (response.data.data === "no") return toast.warning("این سفارش فاقد ردیف محصول است");
      setProducts(response.data.data); setSelectedOrder(order);
    } catch (error) { toast.error(getApiErrorMessage(error, "دریافت جزئیات سفارش ناموفق بود")); }
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <WorkflowHeader icon={ShoppingBasket} eyebrow="آماده‌سازی سفارش" title="سفارش‌های قابل تجمیع" description="با شناسه یا نام مشتری جستجو کنید و اقلام هر سفارش را ببینید." action={<label className="relative block w-full sm:w-72"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input className="field-control pr-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی سفارش…"/></label>} />
      {loading ? <div className="grid min-h-64 place-items-center"><div className="route-progress"/></div> : visibleOrders.length === 0 ? <EmptyState icon={PackageOpen} title="سفارشی یافت نشد" description="عبارت جستجو را تغییر دهید یا بعداً دوباره بررسی کنید."/> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleOrders.map((order) => <button key={order.ordId} type="button" onClick={() => void openOrder(order)} className="workflow-card p-5 text-right hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"><div className="flex items-start justify-between"><div><p className="font-mono text-xs text-blue-700" dir="ltr">{order.ordId}</p><h3 className="mt-1 font-bold text-slate-900">{order.custName}</h3></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{order.orderSituation}</span></div><p className="mt-5 flex items-center gap-2 text-sm text-slate-500"><CalendarDays className="h-4 w-4"/>{new Date(order.orderDate).toLocaleDateString("fa-IR")}</p></button>)}</div>}
      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}><DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl"><DialogHeader><DialogTitle className="text-right">اقلام سفارش {selectedOrder?.ordId}</DialogTitle></DialogHeader><div className="grid gap-3 sm:grid-cols-2">{products.map((product) => <div key={product.prodId} className="rounded-xl border bg-slate-50 p-4"><p className="text-xs text-slate-400">{product.prodId}</p><strong className="mt-1 block">{product.prodName}</strong><p className="mt-2 text-sm text-slate-500">تعداد: {product.contCount.toLocaleString("fa-IR")}</p></div>)}</div><Button variant="outline" onClick={() => setSelectedOrder(null)}>بستن</Button></DialogContent></Dialog>
    </section>
  );
}
