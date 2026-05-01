export function requestCurrentPosition() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Geolocation is not supported."));
  }

  return new Promise((resolve, reject) => {
    let bestPosition = null;
    let settled = false;
    let watchId = null;

    const finish = (position) => {
      if (settled) return;
      settled = true;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      window.clearTimeout(timeoutId);
      resolve(position);
    };

    const timeoutId = window.setTimeout(() => {
      if (bestPosition) {
        finish(bestPosition);
      } else if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        reject(new Error("Location request timed out."));
      }
    }, 8000);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        bestPosition = position;
        if ((position.coords.accuracy || Infinity) <= 2500) {
          finish(position);
        }
      },
      (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        reject(error);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0,
      },
    );
  });
}

export async function navigateToRescuersWithLocation(navigate) {
  try {
    const position = await requestCurrentPosition();
    if ((position.coords.accuracy || Infinity) > 50000) {
      navigate("/find-rescuer");
      return;
    }

    const params = new URLSearchParams({
      lat: String(position.coords.latitude),
      lng: String(position.coords.longitude),
      source: "location",
    });

    navigate(`/rescuer?${params.toString()}`);
  } catch {
    navigate("/find-rescuer");
  }
}
