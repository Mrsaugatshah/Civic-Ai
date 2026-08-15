export function getCurrentLocation(options = {}) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.reject(Object.assign(new Error("This browser does not support location services."), { code: "unsupported" }));
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }),
      (error) => {
        const code = error?.code === 1 ? "permission_denied" : error?.code === 3 ? "timeout" : "unavailable";
        const message = code === "permission_denied"
          ? "Location permission was denied. Choose an area or place the pin manually."
          : code === "timeout"
            ? "Location took too long to respond. Try again or choose an area manually."
            : "Your current location is unavailable. Choose an area or place the pin manually.";
        reject(Object.assign(new Error(message), { code }));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000, ...options },
    );
  });
}
