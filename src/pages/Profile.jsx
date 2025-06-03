const handleDeleteProduct = async (productId) => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    try {
      // First, get all images associated with this product
      const { data: productImages, error: fetchImagesError } = await supabase
        .from('product_images')
        .select('id, product_image')
        .eq('product_id', productId);

      if (fetchImagesError) throw fetchImagesError;

      // Delete each image from storage
      if (productImages && productImages.length > 0) {
        const imagePaths = productImages.map(img => {
          // Extract the file path from the URL
          const url = new URL(img.product_image);
          return url.pathname.split('/storage/v1/object/public/product-images/')[1];
        });

        const { error: deleteStorageError } = await supabase
          .storage
          .from('product-images')
          .remove(imagePaths);

        if (deleteStorageError) throw deleteStorageError;
      }

      // Then delete the product images from database
      const { error: deleteImagesError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);
      
      if (deleteImagesError) throw deleteImagesError;

      // Finally delete the product itself
      const { error: deleteProductError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (deleteProductError) {
        throw deleteProductError;
      } else {
        setProducts(products.filter(product => product.id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  }
  setActiveDropdown(null);
};