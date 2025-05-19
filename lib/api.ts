// lib/api.ts
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"; // http://104.248.12.204:8000/

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pc.ustaxona.bazarchi.software/api/v1";

// Helper function to get the auth token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

// Generic fetch function with authentication
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    const error = await response.json();
    throw new Error(error.detail || "API request failed");
  }

  return response.status === 204 ? {} : response.json();
}

// Generic fetch for multipart/form-data (image uploads)
async function fetchWithFormData(endpoint: string, formData: FormData) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    const error = await response.json();
    throw new Error(error.detail || "Image upload failed");
  }

  return response.json();
}

// Auth API calls
export async function loginUser(email: string, password: string) {
  return fetchWithAuth("/users/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(userData: {
  username: string;
  email: string;
  phone: string;
  password: string;
}) {
  return fetchWithAuth("/users/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function getCurrentUser() {
  return fetchWithAuth("/users/me/");
}

// Announcements API calls
export async function fetchAnnouncements() {
  return fetchWithAuth("/application/announcements/");
}

export async function fetchMyAnnouncements() {
  return fetchWithAuth("/application/announcements/my_announcements/");
}

export async function fetchPendingAnnouncements() {
  return fetchWithAuth("/application/announcements/pending/");
}

export async function fetchAnnouncement(id: number) {
  return fetchWithAuth(`/application/announcements/${id}/`);
}

export async function createAnnouncement(announcementData: {
  title: string;
  description: string;
}) {
  return fetchWithAuth("/application/announcements/", {
    method: "POST",
    body: JSON.stringify(announcementData),
  });
}

export async function updateAnnouncement(id: number, announcementData: any) {
  return fetchWithAuth(`/application/announcements/${id}/`, {
    method: "PUT",
    body: JSON.stringify(announcementData),
  });
}

export async function deleteAnnouncement(id: number) {
  return fetchWithAuth(`/application/announcements/${id}/`, {
    method: "DELETE",
  });
}

export async function acceptAnnouncement(id: number, data: {
  estimated_completion_time: number;
  estimated_price: number;
  products: { product_id: number; quantity: number }[];
}) {
  return fetchWithAuth(`/application/announcements/${id}/accept/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function clientRejectAnnouncement(id: number, rejection_reason: string) {
  return fetchWithAuth(`/application/announcements/${id}/client_reject/`, {
    method: "POST",
    body: JSON.stringify({ rejection_reason }),
  });
}

export async function fetchManagedAnnouncements() {
  const data = await fetchWithAuth("/application/announcements/managed/");
  console.log("Fetched managed announcements:", data);
  return data;
}

export async function rejectAnnouncement(id: number, rejection_reason: string) {
  return fetchWithAuth(`/application/announcements/${id}/reject/`, {
    method: "POST",
    body: JSON.stringify({ rejection_reason }),
  });
}

export async function clientApproveAnnouncement(id: number) {
  return fetchWithAuth(`/application/announcements/${id}/client_approve/`, {
    method: "POST",
  });
}

export async function uploadAnnouncementImages(formData: FormData) {
  return fetchWithFormData("/application/announcements-image/", formData);
}

// Orders API calls
export async function fetchOrders(search?: string, ordering?: string) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (ordering) params.append("ordering", ordering);

  return fetchWithAuth(`/orders/?${params.toString()}`);
}

export async function fetchMyOrders() {
  return fetchWithAuth("/orders/my_orders/");
}

export async function fetchOrder(id: number) {
  return fetchWithAuth(`/orders/${id}/`);
}

export async function createOrder(orderData: any) {
  return fetchWithAuth("/orders/", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function updateOrder(id: number, orderData: any) {
  return fetchWithAuth(`/orders/${id}/`, {
    method: "PUT",
    body: JSON.stringify(orderData),
  });
}

export async function deleteOrder(id: number) {
  return fetchWithAuth(`/orders/${id}/`, {
    method: "DELETE",
  });
}

export async function startProcessingOrder(id: number) {
  return fetchWithAuth(`/orders/${id}/start_processing/`, {
    method: "POST",
  });
}

export async function rejectOrder(id: number, rejection_reason: string) {
  return fetchWithAuth(`/orders/${id}/reject/`, {
    method: "POST",
    body: JSON.stringify({ rejection_reason }),
  });
}

export async function completeOrder(id: number) {
  return fetchWithAuth(`/orders/${id}/complete/`, {
    method: "POST",
  });
}

// Notifications API calls
export async function fetchNotifications() {
  return fetchWithAuth("/application/notifications/");
}

export async function markNotificationAsRead(id: number) {
  return fetchWithAuth(`/application/notifications/${id}/mark_as_read/`, {
    method: "POST",
  });
}

export async function markAllNotificationsAsRead() {
  return fetchWithAuth("/application/notifications/mark_all_as_read/", {
    method: "POST",
  });
}

// Products API calls
export async function fetchProducts(search?: string, ordering?: string) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (ordering) params.append("ordering", ordering);

  return fetchWithAuth(`/products/products/?${params.toString()}`);
}

export async function fetchLowStockProducts() {
  return fetchWithAuth("/products/products/low_stock/");
}

export async function fetchProduct(id: number) {
  return fetchWithAuth(`/products/products/${id}/`);
}

export async function createProduct(productData: any) {
  return fetchWithAuth("/products/products/", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(id: number, productData: any) {
  return fetchWithAuth(`/products/products/${id}/`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(id: number) {
  return fetchWithAuth(`/products/products/${id}/`, {
    method: "DELETE",
  });
}

export async function fetchProductCategories() {
  return fetchWithAuth("/products/categories/");
}

export async function uploadProductImage(imageData: FormData) {
  return fetchWithFormData("/products/product-images/", imageData);
}

// Dashboard API calls
export async function fetchTodayStats() {
  return fetchWithAuth("/products/dashboard/today_stats/");
}

export async function fetchWeeklyStats() {
  return fetchWithAuth("/application/dashboard/weekly_stats/");
}

export async function fetchUserManagementStats() {
  return fetchWithAuth("/application/dashboard/user_management/");
}

// Updated to work with role field instead of is_staff
export async function makeUserManager(userId: number) {
  return fetchWithAuth("/application/dashboard/make_manager/", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

// Updated to work with role field instead of is_staff
export async function removeUserManager(userId: number) {
  return fetchWithAuth("/application/dashboard/remove_manager/", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function fetchPendingOrders() {
  return fetchWithAuth("/application/orders/pending/");
}

export async function fetchUsers() {
  return fetchWithAuth("/user/me/");
}


export async function fetchDashboardStats() {
  return fetchWithAuth("/application/dashboard/today_stats/");
}

export async function uploadOrderImages(formData: FormData) {
  return fetchWithFormData("/application/order_images/", formData);
}

export async function createProductCategory(data: { name: string; description?: string }) {
  return fetchWithAuth("/products/categories/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}