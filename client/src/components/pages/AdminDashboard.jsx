import { useState, useEffect } from 'react';
import DashboardNav from './DashboardNav';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Package, 
  CheckCircle, 
  DollarSign, 
  Upload, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  ShoppingBag,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    price: '',
    quantity: ''
  });
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/materials');
      const data = await response.json();
      if (data.materials) {
        console.log('Fetched materials:', data.materials);
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error('Fetch materials error:', err);
      setError('Failed to load materials');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setUploadingImage(true);
    setError('');
    console.log('Starting image upload...', selectedFile.name);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setUploadingImage(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedFile);

      console.log('Uploading to: http://localhost:5000/api/upload/image');
      const response = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok) {
        setFormData({
          ...formData,
          imageUrl: data.imageUrl
        });
        console.log('Image URL set to:', data.imageUrl);
        setSuccess('Image uploaded successfully!');
        setSelectedFile(null);
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        console.error('Upload failed:', data);
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const url = editingId 
        ? `http://localhost:5000/api/materials/${editingId}`
        : 'http://localhost:5000/api/materials';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          quantity: parseInt(formData.quantity) || 0,
          isActive: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Material saved successfully!');
        console.log('Material saved:', data.material);
        setFormData({
          title: '',
          description: '',
          category: '',
          imageUrl: '',
          price: '',
          quantity: ''
        });
        setEditingId(null);
        fetchMaterials();
      } else {
        console.error('Save failed:', data);
        setError(data.error || 'Failed to save material');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save material');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material) => {
    setFormData({
      title: material.title,
      description: material.description || '',
      category: material.category || '',
      imageUrl: material.imageUrl || '',
      price: material.price || '',
      quantity: material.quantity || ''
    });
    setEditingId(material._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Material deleted successfully!');
        fetchMaterials();
      } else {
        setError(data.error || 'Failed to delete material');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete material');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      price: '',
      quantity: ''
    });
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardNav />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Package className="w-10 h-10 text-blue-600 animate-pulse" />
              Admin Dashboard
            </h1>
            <p className="text-slate-600 text-lg">Manage your textile materials inventory</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-800">{materials.length}</div>
                    <div className="text-sm text-slate-600">Total Materials</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-800">{materials.filter(m => m.quantity > 0).length}</div>
                    <div className="text-sm text-slate-600">In Stock</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-800">Rs.{materials.reduce((sum, m) => sum + (m.price * m.quantity), 0).toFixed(0)}</div>
                    <div className="text-sm text-slate-600">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Alert Messages */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 shadow-xl border-2">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  {editingId ? <Edit className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  {editingId ? 'Edit Material' : 'Add New Material'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter material title"
                      className="border-2 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter material description"
                      className="border-2 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                      <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g., Cotton, Silk"
                        className="border-2 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-semibold">Price (Rs)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="border-2 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-sm font-semibold">Quantity</Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={handleChange}
                          min="0"
                          placeholder="0"
                          className="border-2 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageFile" className="text-sm font-semibold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image
                    </Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          id="imageFile"
                          className="flex-1 border-2 focus:border-blue-500"
                        />
                        {selectedFile && (
                          <Button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {uploadingImage ? 'Uploading...' : 'Upload'}
                          </Button>
                        )}
                      </div>
                      {formData.imageUrl && (
                        <div className="rounded-lg overflow-hidden border-2 border-blue-200">
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-cover" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      {loading ? 'Saving...' : editingId ? 'Update Material' : 'Upload Material'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={cancelEdit} className="border-2">
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Materials Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-2">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Materials Inventory
                  <Badge className="ml-2 bg-blue-600">{materials.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {materials.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <Package className="w-20 h-20 mx-auto text-slate-300" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-slate-600">No Materials Yet</h3>
                      <p className="text-slate-500">Start by adding your first material using the form</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {materials.map((material) => (
                      <Card key={material._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300">
                        <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300">
                          {material.imageUrl && !imageErrors[material._id] ? (
                            <img 
                              src={material.imageUrl} 
                              alt={material.title}
                              className="w-full h-full object-cover"
                              onLoad={(e) => {
                                console.log('✅ Image loaded successfully:', material.imageUrl);
                              }}
                              onError={(e) => {
                                console.error('❌ Image failed to load:', material.imageUrl);
                                setImageErrors(prev => ({...prev, [material._id]: true}));
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                              <ImageIcon className="w-16 h-16 mb-2" />
                              <p className="text-sm font-medium">No Image</p>
                            </div>
                          )}
                          {material.quantity === 0 && (
                            <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <h3 className="text-lg font-bold text-slate-800">{material.title}</h3>
                          {material.description && (
                            <p className="text-sm text-slate-600 line-clamp-2">{material.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {material.category && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                {material.category}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Rs.{material.price}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={material.quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                            >
                              {material.quantity} units
                            </Badge>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              onClick={() => handleEdit(material)} 
                              variant="outline" 
                              size="sm"
                              className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              onClick={() => handleDelete(material._id)} 
                              variant="destructive"
                              size="sm"
                              className="flex-1 bg-red-500 hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
