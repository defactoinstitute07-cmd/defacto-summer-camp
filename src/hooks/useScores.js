import { useEffect, useState, useRef } from "react";

export function useScores(matchId) {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!matchId) return;

    const fetchScores = async () => {
      try {
        const res = await fetch(`/api/scores?matchId=${matchId}&t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch scores");
        const data = await res.json();
        if (isMounted.current && data.success) {
          setScores(data.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err.message);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    const getIntervalTime = (status, isHidden) => {
      if (isHidden) return 60000; // Tab hidden -> 60s
      if (status === "live" || status === "paused") return 5000; // Live/paused -> 5s
      return 30000; // Upcoming/completed -> 30s
    };

    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      const isHidden = document.visibilityState === "hidden";
      const status = scores?.status || "upcoming";
      const time = getIntervalTime(status, isHidden);

      pollingIntervalRef.current = setInterval(fetchScores, time);
    };

    // Trigger initial fetch, then schedule polling
    fetchScores().then(() => {
      startPolling();
    });

    const handleVisibilityChange = () => {
      startPolling();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [matchId, scores?.status]);

  return { scores, loading, error };
}
