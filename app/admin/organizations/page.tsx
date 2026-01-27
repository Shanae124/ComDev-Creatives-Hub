'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/auth-store';
import { Building2, Users, Settings, Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Organization {
  id: number;
  name: string;
  subdomain: string;
  branding: any;
  settings: any;
  status: string;
  created_at: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const { toast } = useToast();
  const user = authStore.getState().user;

  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: '',
    domain: '',
    logo_url: '',
    primary_color: '#3b82f6',
    max_users: 100
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/organizations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          subdomain: formData.subdomain,
          settings: {
            max_users: formData.max_users,
            domain: formData.domain
          },
          branding: {
            logo_url: formData.logo_url,
            primary_color: formData.primary_color
          }
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Organization created successfully'
        });
        setDialogOpen(false);
        fetchOrganizations();
        setFormData({
          name: '',
          subdomain: '',
          description: '',
          domain: '',
          logo_url: '',
          primary_color: '#3b82f6',
          max_users: 100
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create organization',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure? This will delete all data for this organization.')) return;

    try {
      const token = authStore.getState().token;
      const response = await fetch(`http://localhost:3001/api/organizations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Organization deleted'
        });
        fetchOrganizations();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete organization',
        variant: 'destructive'
      });
    }
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading organizations...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground mt-2">
            Manage multi-tenant organizations and their settings
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Set up a new organization with custom branding and settings
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Acme Corporation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain *</Label>
                  <Input
                    id="subdomain"
                    required
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                    placeholder="acme"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.subdomain}.protexxalearn.com
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Custom Domain (Optional)</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="learn.acme.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-16"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_users">Max Users</Label>
                <Input
                  id="max_users"
                  type="number"
                  min="1"
                  value={formData.max_users}
                  onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Organization</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {org.branding?.logo_url ? (
                    <img src={org.branding.logo_url} alt="" className="w-10 h-10 rounded" />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: org.branding?.primary_color || '#3b82f6' }}
                    >
                      {org.name[0]}
                    </div>
                  )}
                  <div>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription>{org.subdomain}.protexxalearn.com</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Max {org.settings?.max_users || 100} users</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{org.status}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(org.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrgs.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No organizations found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first organization to get started'}
          </p>
        </Card>
      )}
    </div>
  );
}
