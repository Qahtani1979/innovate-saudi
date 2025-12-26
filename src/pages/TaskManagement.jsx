import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useExpertAssignments } from '@/hooks/useExpertAssignments';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, Circle, Plus, Calendar, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

function TaskManagement() {
  const { language, isRTL, t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [filter, setFilter] = useState('all');

  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const { triggerEmail } = useEmailTrigger();

  // Filter tasks: admin sees all, others see only their own
  const { useUserTasks, useCreateTask, useUpdateTask } = useTasks({ user, isAdmin });
  const { useAssignments } = useExpertAssignments(user?.email);

  const { data: tasks = [] } = useUserTasks();
  const { data: expertAssignments = [] } = useAssignments();

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const handleCreateTask = (data) => {
    createMutation.mutate(data, {
      onSuccess: (createdTask) => {
        // Trigger email if task is assigned to someone
        if (createdTask?.assigned_to) {
          triggerEmail('task.assigned', {
            entity_type: 'task',
            entity_id: createdTask.id,
            recipient_email: createdTask.assigned_to,
            variables: {
              task_title: createdTask.title,
              due_date: createdTask.due_date,
              priority: createdTask.priority || 'normal'
            }
          }).catch(err => console.error('Email trigger failed:', err));
        }
        setShowForm(false);
        setFormData({});
      }
    });
  };

  const filteredTasks = tasks.filter(t =>
    filter === 'all' || t.status === filter
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'My Tasks', ar: 'مهامي' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Manage your action items and deadlines', ar: 'إدارة المهام والمواعيد النهائية' })}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'New Task', ar: 'مهمة جديدة' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('all')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-600">{tasks.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Tasks', ar: 'إجمالي المهام' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('pending')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'pending').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Pending', ar: 'قيد الانتظار' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('in_progress')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('completed')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتملة' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expert Assignments as Tasks */}
      {expertAssignments.length > 0 && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Users className="h-5 w-5" />
              {t({ en: 'Expert Assignments (Auto-synced)', ar: 'مهام الخبراء (متزامنة تلقائياً)' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expertAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 bg-white border border-purple-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            assignment.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                        }>
                          {assignment.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {assignment.assignment_type}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {assignment.entity_type?.replace(/_/g, ' ')} Evaluation
                      </p>
                      {assignment.due_date && (
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t({ en: 'Due:', ar: 'الموعد:' })} {assignment.due_date}
                        </p>
                      )}
                    </div>
                    <Link to={createPageUrl('ExpertAssignmentQueue')}>
                      <Button size="sm" variant="outline">
                        {t({ en: 'Work on This', ar: 'العمل عليها' })}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t({ en: 'New Task', ar: 'مهمة جديدة' })}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t({ en: 'Task title...', ar: 'عنوان المهمة...' })}
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder={t({ en: 'Description...', ar: 'الوصف...' })}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Priority', ar: 'الأولوية' })}</label>
                <Select value={formData.priority || 'medium'} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}</label>
                <Input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <Button
              className="w-full bg-blue-600"
              onClick={() => handleCreateTask(formData)}
              disabled={!formData.title}
            >
              {t({ en: 'Create Task', ar: 'إنشاء مهمة' })}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => updateMutation.mutate({
                      id: task.id,
                      data: { status: task.status === 'completed' ? 'pending' : 'completed' }
                    })}
                    className="mt-1"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className={
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                      }>
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(TaskManagement, { requiredPermissions: [] });
