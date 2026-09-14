import { useState, useEffect } from 'react';

export const useClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    return {
        hours: ((hours % 12) + minutes / 60) * 30,
        minutes: (minutes + seconds / 60) * 6,
        seconds: seconds * 6,
    };
};
