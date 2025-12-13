import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { 
  UserCheck, Clock, CheckCircle2, XCircle, AlertCircle, 
  Send, Bell, FileSignature, Plus, Trash2 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function StakeholderSignoffTracker({ planId }) {
  const { t, language } = useLanguage();
  const [signoffs, setSignoffs] = useState([
    {
      id: '1',
      stakeholder_name: 'Ahmed Al-Rashid',
      stakeholder_role: 'Deputy Minister',
      requested_date: '2024-01-15',
      due_date: '2024-01-30',
      status: 'approved',
      signed_date: '2024-01-28',
      comments: 'Approved with minor recommendations',
      reminder_count: 0
    },
    {
      id: '2',
      stakeholder_name: 'Sarah Al-Faisal',
      stakeholder_role: 'Innovation Director',
      requested_date: '2024-01-15',
      due_date: '2024-01-30',
      status: 'pending',
      signed_date: null,
      comments: '',
      reminder_count: 2
    },
    {
      id: '3',
      stakeholder_name: 'Mohammed Al-Qahtani',
      stakeholder_role: 'Finance Director',
      requested_date: '2024-01-15',
      due_date: '2024-01-25',
      status: 'changes_requested',
      signed_date: null,
      comments: 'Budget allocation needs revision',
      reminder_count: 1
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSignoff, setNewSignoff] = useState({
    stakeholder_name: '',
    stakeholder_role: '',
    due_date: ''
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: { en: 'Pending', ar: 'قيد الانتظار' }
      },
      approved: { 
        icon: CheckCircle2, 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: { en: 'Approved', ar: 'تمت الموافقة' }
      },
      rejected: { 
        icon: XCircle, 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: { en: 'Rejected', ar: 'مرفوض' }
      },
      changes_requested: { 
        icon: AlertCircle, 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        label: { en: 'Changes Requested', ar: 'تم طلب تغييرات' }
      }
    };
    return configs[status] || configs.pending;
  };

  const handleAddSignoff = () => {
    if (!newSignoff.stakeholder_name || !newSignoff.stakeholder_role) return;
    
    setSignoffs([...signoffs, {
      id: Date.now().toString(),
      ...newSignoff,
      requested_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      signed_date: null,
      comments: '',
      reminder_count: 0
    }]);
    setNewSignoff({ stakeholder_name: '', stakeholder_role: '', due_date: '' });
    setIsDialogOpen(false);
  };

  const handleSendReminder = (id) => {
    setSignoffs(signoffs.map(s => 
      s.id === id ? { ...s, reminder_count: s.reminder_count + 1 } : s
    ));
  };

  const handleRemove = (id) => {
    setSignoffs(signoffs.filter(s => s.id !== id));
  };

  const stats = {
    total: signoffs.length,
    approved: signoffs.filter(s => s.status === 'approved').length,
    pending: signoffs.filter(s => s.status === 'pending').length,
    changes: signoffs.filter(s => s.status === 'changes_requested').length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Approved', ar: 'موافق عليها' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Pending', ar: 'قيد الانتظار' })}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Changes Requested', ar: 'تغييرات مطلوبة' })}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.changes}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tracker Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            {t({ en: 'Stakeholder Sign-off Tracker', ar: 'متتبع توقيعات أصحاب المصلحة' })}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Stakeholder', ar: 'إضافة صاحب مصلحة' })}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t({ en: 'Request Sign-off', ar: 'طلب التوقيع' })}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Stakeholder Name', ar: 'اسم صاحب المصلحة' })}</label>
                  <Input 
                    value={newSignoff.stakeholder_name}
                    onChange={(e) => setNewSignoff({ ...newSignoff, stakeholder_name: e.target.value })}
                    placeholder={t({ en: 'Enter name', ar: 'أدخل الاسم' })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Role', ar: 'الدور' })}</label>
                  <Select 
                    value={newSignoff.stakeholder_role}
                    onValueChange={(value) => setNewSignoff({ ...newSignoff, stakeholder_role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select role', ar: 'اختر الدور' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minister">Minister</SelectItem>
                      <SelectItem value="Deputy Minister">Deputy Minister</SelectItem>
                      <SelectItem value="Director General">Director General</SelectItem>
                      <SelectItem value="Innovation Director">Innovation Director</SelectItem>
                      <SelectItem value="Finance Director">Finance Director</SelectItem>
                      <SelectItem value="Legal Advisor">Legal Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}</label>
                  <Input 
                    type="date"
                    value={newSignoff.due_date}
                    onChange={(e) => setNewSignoff({ ...newSignoff, due_date: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddSignoff} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {t({ en: 'Send Request', ar: 'إرسال الطلب' })}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signoffs.map((signoff) => {
              const config = getStatusConfig(signoff.status);
              const StatusIcon = config.icon;
              
              return (
                <div 
                  key={signoff.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{signoff.stakeholder_name}</p>
                      <p className="text-sm text-muted-foreground">{signoff.stakeholder_role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-muted-foreground">
                        {t({ en: 'Due:', ar: 'الاستحقاق:' })} {signoff.due_date}
                      </p>
                      {signoff.signed_date && (
                        <p className="text-xs text-green-600">
                          {t({ en: 'Signed:', ar: 'موقع:' })} {signoff.signed_date}
                        </p>
                      )}
                    </div>
                    
                    <Badge className={config.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {t(config.label)}
                    </Badge>
                    
                    {signoff.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendReminder(signoff.id)}
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        {signoff.reminder_count > 0 && <span className="mr-1">({signoff.reminder_count})</span>}
                        {t({ en: 'Remind', ar: 'تذكير' })}
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemove(signoff.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {signoffs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {t({ en: 'No sign-off requests yet', ar: 'لا توجد طلبات توقيع بعد' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
