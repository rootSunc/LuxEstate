import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const params = useParams();
  // useEffect 钩子函数不应该直接使用异步函数，因为如果你这么做，它会返回一个 Promise，而不是清理函数或者 undefined。React期望 useEffect 的返回值是一个函数（用于清理），或者是 undefined。因此，当你将异步函数直接作为 useEffect 的执行函数时，会出现警告。(  useEffect(async () => {})
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
        } else {
          setListing(data);
          setError(false);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false); // 在最后总是关闭加载状态
      }
    }
    fetchData();
  }, [params.listingId]); // 依赖数组中包含 `params.listingId`，确保当ID变化时重新获取数据
  console.log(loading);
  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading</p>}
      {error && (
        <p className="text-center my-7 text-2xl">Something went wrong!</p>
      )}
      {listing && !loading && !error && (
        <>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`, // 这是CSS中引用背景图片的方式。它告诉浏览器在给定的URL加载图片，并使用它作为背景。
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}
    </main>
  );
}
