import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { authClient } from '@lark-apaas/client-toolkit/auth';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/src/components/ui/form';
import { authApi } from '@client/src/api';

const registerSchema = z
  .object({
    nickname: z.string().min(2, '昵称至少 2 个字符').max(20, '昵称最多 20 个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少 6 位').max(32, '密码最多 32 位'),
    confirmPassword: z.string().min(6, '请再次输入密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      logger.info('RegisterPage: submitting registration');

      const result = await authApi.register({
        nickname: values.nickname,
        email: values.email,
        password: values.password,
      });

      if (result) {
        toast.success('注册成功，正在进入向导...');
        logger.info('RegisterPage: registration success, redirecting to wizard');
        navigate('/wizard/profile');
      }
    } catch (error) {
      logger.error('RegisterPage: registration failed', String(error));
      toast.error('注册失败，请检查信息后重试');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] py-8">
      <Card className="w-full max-w-md rounded-[28px] border-0 shadow-lg bg-card">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-[20px] bg-primary-gradient flex items-center justify-center shadow-md">
              <Heart className="w-7 h-7 text-white fill-white/30" />
            </div>
          </div>
          <CardTitle className="font-serif text-2xl font-bold text-foreground">
            创建账号
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            加入婚联网·理性心动实验室
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      昵称
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="给自己起个昵称"
                        className="h-11 rounded-xl px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      邮箱
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="h-11 rounded-xl px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      密码
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="至少 6 位"
                        className="h-11 rounded-xl px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      确认密码
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="再次输入密码"
                        className="h-11 rounded-xl px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full h-12 rounded-full text-base font-medium bg-primary-gradient text-primary-foreground border-0 shadow-md hover:shadow-lg transition-shadow mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    注册
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <div className="text-sm text-muted-foreground text-center">
            已有账号？{' '}
            <Link
              to="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              立即登录
            </Link>
          </div>
        </CardFooter>
      </Card>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </button>
    </div>
  );
};

export default RegisterPage;
