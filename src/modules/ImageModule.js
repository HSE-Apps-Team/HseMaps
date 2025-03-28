const importAll = (r) => {
    const images = {};
    r.keys().forEach((key) => {
        images[key.replace('./', '')] = r(key);
    });
    return images;
};

export const ImageModule = {
    streetViewImages: importAll(require.context('../elements/StreetImages', false, /\.(png|jpe?g|svg)$/)),
    getImageUrl: (imageName) => {
        return ImageModule.streetViewImages[imageName] || '';
    }
};
