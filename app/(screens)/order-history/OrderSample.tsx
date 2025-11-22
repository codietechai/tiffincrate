import { useState } from "react";
import { Search, RotateCcw, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderHistoryUI() {
  const [searchTerm, setSearchTerm] = useState("");

const orders = [
  {
    id: 1,
    restaurant: "Sindhi Sweets Since 1976",
    address: "Sector 37, Chandigarh",
    item: "Motichoor Laddu",
    quantity: 1,
    size: "500 Grams",
    date: "09 Nov, 12:25PM",
    price: 356,
    status: "Delivered",
    delivering: false,
    image: "https://agrasweetsbanjara.com/cdn/shop/files/Motichur-Laddu-agrasweets-banjara.jpg?v=1731671743",
  },
  {
    id: 2,
    restaurant: "Awadhi Central",
    address: "Sector 8, Chandigarh",
    item: "Veg Seekh Kebab",
    quantity: 1,
    size: "",
    date: "04 Nov, 7:13PM",
    price: 193.73,
    status: "Delivered",
    delivering: true,
    image: "https://media.istockphoto.com/id/501266025/photo/seekh-kabab-5.jpg?s=612x612&w=0&k=20&c=D6JXEtB4OLF9A91nAfDYLlh507LlbmP_M9PZBoJqD9Q=",
  },
  {
    id: 3,
    restaurant: "Haldiram's Sweets & Snacks",
    address: "Sector 35, Chandigarh",
    item: "Rasgulla Tin Pack",
    quantity: 1,
    size: "1 Kg",
    date: "02 Nov, 3:45PM",
    price: 210,
    status: "Delivered",
    delivering: true,
    image: "https://www.haldiram.com/media/catalog/product/r/a/rasgulla_tin_1kg.png",
  },
  {
    id: 4,
    restaurant: "Annapurna Bhojanalaya",
    address: "Sector 40, Chandigarh",
    item: "Rajma Chawal",
    quantity: 1,
    size: "Full Plate",
    date: "01 Nov, 1:00PM",
    price: 120,
    status: "Delivered",
    delivering: true,
    image: "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/Archana_Doshi/Rajma_Chawal_Recipe_North_Indian_Rajma_Masala_with_Rice-1-2.jpg",
  },
  {
    id: 5,
    restaurant: "Chawla's Tandoori Hub",
    address: "Sector 10, Chandigarh",
    item: "Tandoori Chicken",
    quantity: 1,
    size: "Half",
    date: "31 Oct, 8:22PM",
    price: 299,
    status: "Delivered",
    delivering: false,
    image: "https://static.toiimg.com/thumb/61050394.cms?width=1200&height=900",
  },
  {
    id: 6,
    restaurant: "Sagar Ratna",
    address: "Sector 17, Chandigarh",
    item: "Masala Dosa",
    quantity: 1,
    size: "",
    date: "29 Oct, 10:10AM",
    price: 180,
    status: "Delivered",
    delivering: true,
    image: "https://www.sagarratna.in/images/dish/masala_dosa.jpg",
  },
  {
    id: 7,
    restaurant: "Gopal Sweets",
    address: "Sector 35, Chandigarh",
    item: "Besan Ladoo",
    quantity: 1,
    size: "500 Grams",
    date: "25 Oct, 2:30PM",
    price: 290,
    status: "Delivered",
    delivering: true,
    image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/10/besan-ladoo-recipe.jpg",
  },
  {
    id: 8,
    restaurant: "Katani Dhaba",
    address: "Sector 15, Chandigarh",
    item: "Paneer Butter Masala",
    quantity: 1,
    size: "Full Plate",
    date: "23 Oct, 1:00PM",
    price: 240,
    status: "Delivered",
    delivering: false,
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/02/paneer-butter-masala-1.jpg",
  },
  {
    id: 9,
    restaurant: "Burger Singh",
    address: "Sector 9, Chandigarh",
    item: "United States of Punjab Burger",
    quantity: 1,
    size: "Regular",
    date: "22 Oct, 6:45PM",
    price: 199,
    status: "Delivered",
    delivering: true,
    image: "https://www.burgersinghonline.com/images/burger.jpg",
  },
  {
    id: 10,
    restaurant: "Nukkar Dhaba",
    address: "Sector 11, Chandigarh",
    item: "Dal Makhani & Naan",
    quantity: 1,
    size: "",
    date: "20 Oct, 12:15PM",
    price: 180,
    status: "Delivered",
    delivering: true,
    image: "https://www.cookwithmanali.com/wp-content/uploads/2020/08/Dal-Makhani-500x500.jpg",
  },
  {
    id: 11,
    restaurant: "Subway",
    address: "Elante Mall, Chandigarh",
    item: "Veggie Delite Sub",
    quantity: 1,
    size: "6 inch",
    date: "18 Oct, 7:40PM",
    price: 220,
    status: "Delivered",
    delivering: true,
    image: "https://www.subway.com/ns/images/menu/IND/ENG/footlong_veggie_delite.jpg",
  },
  {
    id: 12,
    restaurant: "Domino's Pizza",
    address: "Sector 32, Chandigarh",
    item: "Farmhouse Pizza",
    quantity: 1,
    size: "Medium",
    date: "15 Oct, 9:00PM",
    price: 499,
    status: "Delivered",
    delivering: true,
    image: "https://www.dominos.co.in/files/items/Farmhouse.jpg",
  },
];


  const filteredOrders = orders.filter((o) =>
    o.restaurant.toLowerCase().includes(searchTerm.toLowerCase())
  );

return (
<div className="min-h-screen bg-gray-50">
<div className="max-w-7xl mx-auto px-4 py-6">
<h1 className="text-2xl md:text-3xl font-semibold mb-4">Your Orders</h1>


<div className="relative mb-6 max-w-lg mx-auto md:mx-0">
<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
<Input
placeholder="Search by restaurant or dish"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="pl-10"
/>
</div>


<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
{filteredOrders.map((order) => (
<Card
key={order.id}
className="shadow-sm hover:shadow-md transition border border-gray-100"
>
<CardContent className="p-4 flex flex-col justify-between h-full">
<div className="flex gap-3">
<img
src={order.image}
alt={order.item}
className="h-16 w-16 rounded-md object-cover flex-shrink-0"
/>


<div className="flex-1">
<h2 className="font-semibold text-gray-900 text-sm md:text-base">
{order.restaurant}
</h2>
<p className="text-gray-500 text-xs md:text-sm">{order.address}</p>
<p className="text-red-500 text-xs font-medium cursor-pointer">
View menu
</p>
<div className="mt-2 text-sm text-gray-700">
<p>
{order.quantity} x {order.item} {order.size}
</p>
<p className="text-xs text-gray-500">
Order placed on {order.date}
</p>
<p className="text-xs text-green-600 font-medium">
{order.status}
</p>
</div>
</div>


<div className="text-right">
<p className="font-semibold text-sm md:text-base">₹{order.price}</p>
</div>
</div>


<div className="mt-3 flex justify-between items-center border-t pt-2">
<div className="flex text-yellow-400 text-sm gap-1">
{[...Array(5)].map((_, i) => (
<Star key={i} className="h-4 w-4 text-gray-300" />
))}
</div>


{order.delivering ? (
<Button
size="sm"
variant="destructive"
className="flex items-center gap-1 text-xs md:text-sm"
>
<RotateCcw className="h-4 w-4" /> Reorder
</Button>
) : (
<Button
size="sm"
variant="outline"
disabled
className="text-xs md:text-sm"
>
Currently not delivering
</Button>
)}
</div>
</CardContent>
</Card>
))}
</div>
</div>
</div>
);
}