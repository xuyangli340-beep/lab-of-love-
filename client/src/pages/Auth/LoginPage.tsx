import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { authClient } from '@lark-apaas/client-toolkit/auth';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Checkbox } from '@client/src/components/ui/checkbox';
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

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      logger.info('LoginPage: submitting login');

      const result = await authApi.login({
        email: values.email,
        password: values.password,
      });

      if (result) {
        toast.success('登录成功');
        logger.info('LoginPage: login success, redirecting to wizard');
        navigate('/wizard/profile');
      }
    } catch (error) {
      logger.error('LoginPage: login failed', String(error));
      toast.error('登录失败，请检查邮箱和密码');
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
            欢迎回来
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            登录婚联网·理性心动实验室
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-foreground">
                        密码
                      </FormLabel>
                      <Link
                        to="/auth/reset-password"
                        className="text-xs text-primary hover:underline"
                      >
                        忘记密码？
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入密码"
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
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-muted-foreground cursor-pointer">
                        记住我
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full h-12 rounded-full text-base font-medium bg-primary-gradient text-primary-foreground border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    登录
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <div className="text-sm text-muted-foreground text-center">
            还没有账号？{' '}
            <Link
              to="/auth/register"
              className="text-primary font-medium hover:underline"
            >
              立即注册
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

export default LoginPage;
