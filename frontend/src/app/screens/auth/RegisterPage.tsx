import { useState } from "react";
import {
  Mail, Lock, Eye, EyeOff, Truck, User, Phone, Building2,
  FileText, Upload, ChevronRight, ChevronLeft, Check, AlertCircle, Loader2
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type UserType = "driver" | "carrier";

interface DriverForm {
  fullName: string;
  cpf: string;
  phone: string;
  cnhNumber: string;
  cnhCategory: string;
  cnhValidity: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface CarrierForm {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterPageProps {
  onSuccess: (tokens: { accessToken: string; refreshToken: string }) => void;
  onSwitchToLogin: () => void;
}

// ── Service ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

async function registerUser(payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    if (data.fields) {
      const messages = Object.values(data.fields).join(". ");
      throw new Error(messages);
    }
    throw new Error(data.detail ?? data.message ?? "Erro ao criar conta.");
  }

  return data as { accessToken: string; refreshToken: string };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CNH_CATEGORIES = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];

const STEPS = [
  { number: 1, title: "Dados", description: "Informações básicas" },
  { number: 2, title: "Documentos", description: "Upload e detalhes" },
  { number: 3, title: "Acesso", description: "Email e senha" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function RegisterPage({ onSuccess, onSwitchToLogin }: RegisterPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType>("driver");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [driverForm, setDriverForm] = useState<DriverForm>({
    fullName: "", cpf: "", phone: "", cnhNumber: "",
    cnhCategory: "C", cnhValidity: "", email: "", password: "", confirmPassword: "",
  });

  const [carrierForm, setCarrierForm] = useState<CarrierForm>({
    razaoSocial: "", nomeFantasia: "", cnpj: "",
    phone: "", email: "", password: "", confirmPassword: "",
  });

  const [files, setFiles] = useState({
    cnh: null as File | null,
    crlv: null as File | null,
    contratoSocial: null as File | null,
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDriverForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleCarrierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarrierForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const form = userType === "driver" ? driverForm : carrierForm;

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      let payload: Record<string, unknown>;

      if (userType === "driver") {
        payload = {
          role: "DRIVER",
          fullName: driverForm.fullName,
          cpf: driverForm.cpf.replace(/\D/g, ""),
          phone: driverForm.phone,
          cnhNumber: driverForm.cnhNumber,
          cnhCategory: driverForm.cnhCategory,
          cnhValidity: driverForm.cnhValidity,
          email: driverForm.email,
          password: driverForm.password,
        };
      } else {
        payload = {
          role: "CARRIER",
          razaoSocial: carrierForm.razaoSocial,
          nomeFantasia: carrierForm.nomeFantasia || undefined,
          cnpj: carrierForm.cnpj.replace(/\D/g, ""),
          phone: carrierForm.phone,
          email: carrierForm.email,
          password: carrierForm.password,
        };
      }

      // TODO: Para envio de arquivos no futuro, converter 'payload' para FormData
      const tokens = await registerUser(payload);
      onSuccess(tokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-center">
        
        {/* Mobile Branding */}
        <div className="lg:hidden text-center mb-6">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Truck className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Swift Way</h1>
              <p className="text-sm text-muted-foreground">Sistema Logístico</p>
            </div>
          </div>
        </div>

        {/* Left side - Branding Desktop */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Truck className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Swift Way</h1>
              <p className="text-muted-foreground">Sistema Logístico Inteligente</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Junte-se à Nossa Rede</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cadastre-se agora e faça parte da maior plataforma de gestão logística do Brasil.
            </p>

            <div className="space-y-3 pt-4">
              {[
                "Gestão simplificada de cargas",
                "Rastreamento em tempo real",
                "Documentação centralizada",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Register Form */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 md:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Criar Conta</h2>
            <p className="text-muted-foreground">
              Passo {currentStep} de 3: {STEPS[currentStep - 1].title}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep > step.number
                          ? "bg-primary border-primary text-primary-foreground"
                          : currentStep === step.number
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="font-medium">{step.number}</span>
                      )}
                    </div>
                    <p className="text-xs mt-2 text-center text-muted-foreground hidden sm:block">
                      {step.title}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        currentStep > step.number ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Type Selection (only on step 1) */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(["driver", "carrier"] as UserType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setUserType(type); setError(null); }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === type
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {type === "driver" ? (
                    <Truck className={`w-6 h-6 mx-auto mb-2 ${userType === type ? "text-primary" : "text-muted-foreground"}`} />
                  ) : (
                    <Building2 className={`w-6 h-6 mx-auto mb-2 ${userType === type ? "text-primary" : "text-muted-foreground"}`} />
                  )}
                  <p className={`text-sm font-medium ${userType === type ? "text-primary" : "text-muted-foreground"}`}>
                    {type === "driver" ? "Motorista" : "Transportadora"}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ── STEP 1: DADOS BÁSICOS ── */}
            {currentStep === 1 && userType === "driver" && (
              <>
                <Field label="Nome Completo">
                  <IconInput icon={<User />} name="fullName" type="text"
                    value={driverForm.fullName} onChange={handleDriverChange}
                    placeholder="João da Silva" required />
                </Field>
                <Field label="CPF">
                  <IconInput icon={<FileText />} name="cpf" type="text"
                    value={driverForm.cpf} onChange={handleDriverChange}
                    placeholder="000.000.000-00" required />
                </Field>
                <Field label="Telefone">
                  <IconInput icon={<Phone />} name="phone" type="tel"
                    value={driverForm.phone} onChange={handleDriverChange}
                    placeholder="(48) 99999-0000" required />
                </Field>
              </>
            )}

            {currentStep === 1 && userType === "carrier" && (
              <>
                <Field label="Razão Social">
                  <IconInput icon={<Building2 />} name="razaoSocial" type="text"
                    value={carrierForm.razaoSocial} onChange={handleCarrierChange}
                    placeholder="Transportadora ABC Ltda" required />
                </Field>
                <Field label="Nome Fantasia (opcional)">
                  <IconInput icon={<Building2 />} name="nomeFantasia" type="text"
                    value={carrierForm.nomeFantasia} onChange={handleCarrierChange}
                    placeholder="ABC Transportes" />
                </Field>
                <Field label="CNPJ">
                  <IconInput icon={<FileText />} name="cnpj" type="text"
                    value={carrierForm.cnpj} onChange={handleCarrierChange}
                    placeholder="00.000.000/0000-00" required />
                </Field>
                <Field label="Telefone">
                  <IconInput icon={<Phone />} name="phone" type="tel"
                    value={carrierForm.phone} onChange={handleCarrierChange}
                    placeholder="(48) 99999-0000" required />
                </Field>
              </>
            )}

            {/* ── STEP 2: DOCUMENTOS ── */}
            {currentStep === 2 && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Detalhes e Documentos</h3>
                  <p className="text-sm text-muted-foreground">
                    {userType === "carrier" ? "Faça upload dos documentos da empresa" : "Preencha os dados da CNH e faça os uploads"}
                  </p>
                </div>

                {userType === "driver" ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Nº da CNH">
                        <input name="cnhNumber" type="text"
                          value={driverForm.cnhNumber} onChange={handleDriverChange}
                          placeholder="12345678901" required
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground" />
                      </Field>
                      <Field label="Categoria">
                        <select name="cnhCategory"
                          value={driverForm.cnhCategory} onChange={handleDriverChange} required
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
                          {CNH_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    
                    <Field label="Validade da CNH">
                      <input name="cnhValidity" type="date"
                        value={driverForm.cnhValidity} onChange={handleDriverChange} required
                        className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground" />
                    </Field>

                    <div className="pt-2 border-t border-border mt-4">
                      <Field label="Foto da CNH">
                        <div className="relative mt-2">
                          <input type="file" id="cnh" onChange={(e) => handleFileChange(e, "cnh")} accept="image/*,.pdf" className="hidden" />
                          <label htmlFor="cnh" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-input-background border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {files.cnh ? files.cnh.name : "Clique para fazer upload"}
                            </span>
                          </label>
                        </div>
                      </Field>
                    </div>

                    <Field label="CRLV (Documento do Veículo)">
                      <div className="relative">
                        <input type="file" id="crlv" onChange={(e) => handleFileChange(e, "crlv")} accept="image/*,.pdf" className="hidden" />
                        <label htmlFor="crlv" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-input-background border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {files.crlv ? files.crlv.name : "Clique para fazer upload"}
                          </span>
                        </label>
                      </div>
                    </Field>
                  </>
                ) : (
                  <Field label="Contrato Social">
                    <div className="relative">
                      <input type="file" id="contratoSocial" onChange={(e) => handleFileChange(e, "contratoSocial")} accept="image/*,.pdf" className="hidden" />
                      <label htmlFor="contratoSocial" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-input-background border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {files.contratoSocial ? files.contratoSocial.name : "Clique para fazer upload"}
                        </span>
                      </label>
                    </div>
                  </Field>
                )}

                <div className="bg-accent/30 border border-accent rounded-lg p-4 mt-4">
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Documentos aceitos</p>
                      <p className="text-xs text-muted-foreground mt-1">Formatos: JPG, PNG, PDF • Tamanho máximo: 5MB</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: ACESSO ── */}
            {currentStep === 3 && (
              <>
                <Field label="E-mail">
                  <IconInput icon={<Mail />} name="email" type="email"
                    value={userType === "driver" ? driverForm.email : carrierForm.email}
                    onChange={userType === "driver" ? handleDriverChange : handleCarrierChange}
                    placeholder="seu@email.com" required />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Senha">
                    <PasswordInput name="password"
                      value={userType === "driver" ? driverForm.password : carrierForm.password}
                      onChange={userType === "driver" ? handleDriverChange : handleCarrierChange}
                      show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                  </Field>
                  <Field label="Confirmar Senha">
                    <PasswordInput name="confirmPassword"
                      value={userType === "driver" ? driverForm.confirmPassword : carrierForm.confirmPassword}
                      onChange={userType === "driver" ? handleDriverChange : handleCarrierChange}
                      show={showPassword} />
                  </Field>
                </div>

                <div className="bg-accent/30 border border-accent rounded-lg p-4 mt-4">
                  <div className="flex gap-3">
                    <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Requisitos de senha</p>
                      <p className="text-xs text-muted-foreground mt-1">Mínimo 6 caracteres</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Anterior
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading && currentStep === 3 && <Loader2 className="w-4 h-4 animate-spin" />}
                {currentStep === 3 ? (loading ? "Criando conta..." : "Criar Conta") : "Próximo"}
                {currentStep < 3 && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>

            {currentStep === 1 && (
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary font-medium hover:underline"
                  >
                    Fazer login
                  </button>
                </p>
              </div>
            )}
          </form>

          {currentStep === 3 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Ao criar uma conta, você concorda com nossos{" "}
                <button className="text-primary hover:underline">Termos de Serviço</button> e{" "}
                <button className="text-primary hover:underline">Política de Privacidade</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function IconInput({
  icon, name, type, value, onChange, placeholder, required,
}: {
  icon: React.ReactNode;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </span>
      <input
        name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}

function PasswordInput({
  name, value, onChange, show, onToggle,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        name={name} type={show ? "text" : "password"} value={value}
        onChange={onChange} placeholder="••••••••" required
        className="w-full pl-10 pr-10 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
      />
      {onToggle && (
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}