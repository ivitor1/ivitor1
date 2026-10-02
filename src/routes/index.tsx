import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Utensils, Scale, Plus, Flame, Loader2, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: DashboardComponent,
});

interface ActivityItem {
  id: string;
  kind: string;
  distance_km: number;
  duration_min: number;
  notes: string | null;
  created_at: string;
}

interface FoodLogItem {
  id: string;
  meal: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

interface BodyMetricItem {
  id: string;
  weight_kg: number;
  created_at: string;
}

function DashboardComponent() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [actKind, setActKind] = useState('corrida');
  const [actDistance, setActDistance] = useState('');
  const [actDuration, setActDuration] = useState('');

  const [foodMeal, setFoodMeal] = useState('Café da Manhã');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');

  const [weightKg, setWeightKg] = useState('');

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [actRes, foodRes, bodyRes] = await Promise.all([
        supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('food_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('body_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (actRes.data) setActivities(actRes.data as ActivityItem[]);
      if (foodRes.data) setFoodLogs(foodRes.data as FoodLogItem[]);
      if (bodyRes.data) setBodyMetrics(bodyRes.data as BodyMetricItem[]);

      if (actRes.error || foodRes.error || bodyRes.error) {
        setNotice(
          'Não foi possível carregar seu histórico agora. Você ainda pode registrar novas informações nos formulários abaixo.',
        );
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setNotice(
        'Não foi possível carregar seu histórico agora. Você ainda pode registrar novas informações nos formulários abaixo.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actDistance || !actDuration) return;

    const { error } = await supabase.from('activities').insert([
      {
        kind: actKind,
        distance_km: parseFloat(actDistance),
        duration_min: parseFloat(actDuration),
      },
    ]);

    if (error) {
      setNotice('Não deu para salvar a atividade: ' + error.message);
      return;
    }

    setNotice(null);
    setActDistance('');
    setActDuration('');
    void fetchDashboardData();
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !foodCalories) return;

    const { error } = await supabase.from('food_logs').insert([
      {
        meal: foodMeal,
        name: foodName,
        calories: parseFloat(foodCalories),
      },
    ]);

    if (error) {
      setNotice('Não deu para salvar a refeição: ' + error.message);
      return;
    }

    setNotice(null);
    setFoodName('');
    setFoodCalories('');
    void fetchDashboardData();
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;

    const { error } = await supabase.from('body_metrics').insert([
      {
        weight_kg: parseFloat(weightKg),
      },
    ]);

    if (error) {
      setNotice('Não deu para salvar o peso: ' + error.message);
      return;
    }

    setNotice(null);
    setWeightKg('');
    void fetchDashboardData();
  };

  const totalCalories = foodLogs.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
  const totalDistance = activities.reduce((acc, curr) => acc + (Number(curr.distance_km) || 0), 0);
  const latestWeight = bodyMetrics.length > 0 ? bodyMetrics[0].weight_kg : '--';

  return (
    <div className="space-y-6">
      {notice && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{notice}</p>
        </div>
      )}

      <div className="rounded-2xl bg-gradient-to-r from-emerald-900/50 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Flame className="w-3.5 h-3.5" /> NXA Fit Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Acompanhe sua evolução em tempo real
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            Registre seus treinos, alimentação e medições corporais de forma rápida e integrada.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Distância Percorrida</p>
            {loading ? (
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
              </p>
            ) : (
              <p className="text-2xl font-bold text-white">
                {totalDistance.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">km</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Calorias Registradas</p>
            {loading ? (
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
              </p>
            ) : (
              <p className="text-2xl font-bold text-white">
                {totalCalories}{' '}
                <span className="text-xs text-slate-400 font-normal">kcal</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Último Peso</p>
            {loading ? (
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
              </p>
            ) : (
              <p className="text-2xl font-bold text-white">
                {latestWeight}{' '}
                <span className="text-xs text-slate-400 font-normal">kg</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5" />
            <h3>Atividades Físicas</h3>
          </div>

          <form onSubmit={handleAddActivity} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Tipo</label>
              <select
                value={actKind}
                onChange={(e) => setActKind(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="corrida">Corrida</option>
                <option value="caminhada">Caminhada</option>
                <option value="ciclismo">Ciclismo</option>
                <option value="natacao">Natação</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Distância (km)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                  value={actDistance}
                  onChange={(e) => setActDistance(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Duração (min)</label>
                <input
                  type="number"
                  placeholder="30"
                  value={actDuration}
                  onChange={(e) => setActDuration(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Atividade
            </button>
          </form>

          <div className="flex-1 space-y-2 pt-2 border-t border-slate-800/60">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Histórico Recente
            </h4>
            {loading ? (
              <p className="text-xs text-slate-500 py-2 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando registros...
              </p>
            ) : activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Nenhuma atividade registrada.</p>
            ) : (
              activities.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3 rounded-lg flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200 capitalize">{item.kind}</p>
                    <p className="text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{item.distance_km} km</p>
                    <p className="text-slate-400">{item.duration_min} min</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2 text-orange-400 font-semibold border-b border-slate-800 pb-3">
            <Utensils className="w-5 h-5" />
            <h3>Alimentação</h3>
          </div>

          <form onSubmit={handleAddFood} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Refeição</label>
              <select
                value={foodMeal}
                onChange={(e) => setFoodMeal(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              >
                <option value="Café da Manhã">Café da Manhã</option>
                <option value="Almoço">Almoço</option>
                <option value="Jantar">Jantar</option>
                <option value="Lanche">Lanche</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Alimento / Nome</label>
              <input
                type="text"
                placeholder="Ex: Ovos cozidos e aveia"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Calorias (kcal)</label>
              <input
                type="number"
                placeholder="350"
                value={foodCalories}
                onChange={(e) => setFoodCalories(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Refeição
            </button>
          </form>

          <div className="flex-1 space-y-2 pt-2 border-t border-slate-800/60">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Histórico Recente
            </h4>
            {loading ? (
              <p className="text-xs text-slate-500 py-2 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando registros...
              </p>
            ) : foodLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Nenhuma refeição registrada.</p>
            ) : (
              foodLogs.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3 rounded-lg flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{item.name}</p>
                    <p className="text-slate-500">{item.meal}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-400">{item.calories} kcal</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-semibold border-b border-slate-800 pb-3">
            <Scale className="w-5 h-5" />
            <h3>Peso & Medições</h3>
          </div>

          <form onSubmit={handleAddWeight} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="75.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Peso
            </button>
          </form>

          <div className="flex-1 space-y-2 pt-2 border-t border-slate-800/60">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Histórico Recente
            </h4>
            {loading ? (
              <p className="text-xs text-slate-500 py-2 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando registros...
              </p>
            ) : bodyMetrics.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Nenhuma medição registrada.</p>
            ) : (
              bodyMetrics.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3 rounded-lg flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">Peso Corporal</p>
                    <p className="text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">{item.weight_kg} kg</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
