import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Shield, CheckCircle, Star, ArrowRight, Wallet, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Utility for Indian Rupee formatting
const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

interface Package {
  id: string;
  name: string;
  price: number;
  guests: string;
  icon: any;
  popular: boolean;
  features: string[];
  description: string;
  includes: any;
}

interface PaymentModuleProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const PaymentModule = ({ package: selectedPackage, isOpen, onClose, onPaymentComplete }: PaymentModuleProps) => {
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [advanceAmount, setAdvanceAmount] = useState(selectedPackage.price * 0.3); // 30% advance

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      popular: true,
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Google Pay, PhonePe, Paytm',
      icon: Wallet,
      popular: true,
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major banks supported',
      icon: Shield,
    },
  ];

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setCurrentStep(2);
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(3);
      toast({
        title: "Payment Successful! 🎉",
        description: `Advance payment of ${formatINR(advanceAmount)} has been processed successfully.`,
      });
      
      setTimeout(() => {
        onPaymentComplete();
        onClose();
        setCurrentStep(1);
        setSelectedPaymentMethod('');
      }, 2000);
    }, 3000);
  };

  const IconComponent = selectedPackage.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <IconComponent className="h-6 w-6 text-primary" />
            Complete Your Wedding Package Booking
          </DialogTitle>
          <DialogDescription>
            Secure your {selectedPackage.name} package with an advance payment
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Package Summary */}
          <div className="space-y-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    {selectedPackage.name}
                  </CardTitle>
                  {selectedPackage.popular && (
                    <Badge className="bg-gradient-primary text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription>{selectedPackage.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Total Package Value:</span>
                  <span className="font-bold text-primary">{formatINR(selectedPackage.price)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{selectedPackage.guests}</span>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Package Includes:</h4>
                  <div className="space-y-2">
                    {selectedPackage.features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {selectedPackage.features.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        +{selectedPackage.features.length - 5} more features
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payment Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="font-medium">Advance Payment (30%)</span>
                  <span className="font-bold text-primary">{formatINR(advanceAmount)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Remaining Amount</span>
                  <span>{formatINR(selectedPackage.price - advanceAmount)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  * Remaining amount to be paid 15 days before the event
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Process */}
          <div className="space-y-4">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 mx-2 transition-colors ${
                      currentStep > step ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Payment Method Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                  <CardDescription>Choose your preferred payment option</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paymentMethods.map((method) => {
                    const MethodIcon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                          selectedPaymentMethod === method.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MethodIcon className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {method.name}
                                {method.popular && (
                                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Complete your payment for {formatINR(advanceAmount)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPaymentMethod === 'card' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input id="expiryDate" placeholder="MM/YY" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input id="cardName" placeholder="John Doe" />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedPaymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input id="upiId" placeholder="yourname@paytm" />
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground mb-2">
                          You will be redirected to your UPI app to complete payment
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Your Bank</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sbi">State Bank of India</SelectItem>
                            <SelectItem value="hdfc">HDFC Bank</SelectItem>
                            <SelectItem value="icici">ICICI Bank</SelectItem>
                            <SelectItem value="axis">Axis Bank</SelectItem>
                            <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the terms and conditions and booking policy
                      </Label>
                    </div>
                    
                    <Button 
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      className="w-full bg-gradient-primary hover:opacity-90"
                      size="lg"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Pay {formatINR(advanceAmount)} Securely
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Success */}
            {currentStep === 3 && (
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Payment Successful!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your advance payment of {formatINR(advanceAmount)} has been processed successfully.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ Booking confirmed for {selectedPackage.name}</p>
                    <p>✓ Confirmation email sent</p>
                    <p>✓ Our team will contact you within 24 hours</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <Shield className="h-4 w-4" />
              <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModule;