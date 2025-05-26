import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings</p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your basic account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="john@acmebusiness.co.ke" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select 
                  id="language" 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="marketing" className="flex-1">
                  Marketing emails
                  <span className="block text-xs text-muted-foreground">
                    Receive emails about new features and updates
                  </span>
                </Label>
                <Switch id="marketing" defaultChecked={true} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Manage your business profile and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" defaultValue="Acme Business Solutions" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input id="businessAddress" defaultValue="123 Business Street, Nairobi, Kenya" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input id="businessPhone" defaultValue="+254 7XX XXX XXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input id="taxId" defaultValue="TAX12345678" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="p-8 flex items-center justify-center min-h-[200px] rounded-md border">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Billing Settings Module</h3>
            <p>This section will contain billing and subscription management features</p>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="p-8 flex items-center justify-center min-h-[200px] rounded-md border">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Notification Settings Module</h3>
            <p>This section will contain notification preferences and management</p>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="p-8 flex items-center justify-center min-h-[200px] rounded-md border">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Security Settings Module</h3>
            <p>This section will contain password, 2FA, and security settings</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 