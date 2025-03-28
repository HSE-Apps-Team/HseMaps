import React, { useEffect, useRef } from 'react';

export const ImagePreloader = ({ images, onLoad }) => {
    const loadedCount = useRef(0);
    const totalImages = images.length;

    useEffect(() => {
        if (loadedCount.current === totalImages && onLoad) {
            onLoad();
        }
    }, [loadedCount.current, totalImages, onLoad]);

    return (
        <div style={{ display: 'none' }}>
            {images.map((src, index) => (
                <img
                    key={index}
                    src={src}
                    alt="preload"
                    onLoad={() => {
                        loadedCount.current += 1;
                    }}
                />
            ))}
        </div>
    );
};
