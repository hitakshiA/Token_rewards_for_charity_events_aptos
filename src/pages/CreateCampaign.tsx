// src/pages/CreateCampaign.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { aptos } from '@/services/aptos';

const campaignSchema = z.object({
  description: z.string().min(50, "Description must be at least 50 characters."),
  goalAmount: z.coerce.number().positive("Goal must be a positive number."),
  durationDays: z.coerce.number().min(1, "Duration must be at least 1 day.").max(90, "Duration cannot exceed 90 days."),
});

const CreateCampaign = () => {
  const { signAndSubmitTransaction, connected } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof campaignSchema>>({ resolver: zodResolver(campaignSchema) });

  async function onSubmit(values: z.infer<typeof campaignSchema>) {
    if (!connected) {
      toast({ title: "Please connect your wallet first.", variant: "destructive" });
      return;
    }

    const endTimestampSecs = Math.floor(Date.now() / 1000) + (values.durationDays * 24 * 60 * 60);
    const goalInOctas = values.goalAmount * 100_000_000;

    const payload = {
      data: {
        function: `${CONTRACT_ADDRESS}::charity::create_campaign` as `${string}::${string}::${string}`,
        functionArguments: [
          values.description,
          String(goalInOctas),
          String(endTimestampSecs),
        ],
      },
    };

    try {
      const response = await signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      toast({ title: "Campaign Created Successfully!", description: "It will be available in the marketplace shortly." });
      navigate('/marketplace');
    } catch (error) {
      console.error("Campaign creation failed:", error);
      toast({ title: "Campaign Creation Failed", description: "Please try again.", variant: "destructive" });
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="text-4xl font-shadows mb-8 text-center">Create a New Campaign</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 card-garden p-8">
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Title / Description</FormLabel>
              <FormControl><Textarea placeholder="Describe your cause, its goals, and how the funds will be used..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-2 gap-8">
            <FormField control={form.control} name="goalAmount" render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Amount (in APT)</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 5000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="durationDays" render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (in Days)</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full btn-garden-primary" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit Campaign"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCampaign;