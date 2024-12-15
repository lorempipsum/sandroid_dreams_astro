import fs from "fs/promises";
import path from "path";

import ImageContainer from "./ImageContainer";

import styles from "./manyImages.module.scss";


export async function getImageFiles(imagesFolder: string) {

    const imageFiles = await fs.readdir(imagesFolder);


    // Filter the list to include only image files (you can customize this filter)
    const imageFilesFiltered = imageFiles.filter((file) =>
        /\.(webp)$/i.test(file)
    );

    return imageFilesFiltered;
};

const ManyImages = async ({folderPath}: {folderPath: string}) => {

    const imageFiles = await getImageFiles(folderPath);

    return <div className="image-gallery">
    {
        imageFiles.map((fileName: string) => (
            <ImageContainer
                src={path.join("/", folderPath, fileName)}
                id={`${fileName}`}
            />
        ))
    }
</div>
};

export default ManyImages;