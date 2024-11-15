"use client";

import {
  TrendingUp,
  ArrowRight,
  Plus,
  Loader2,
  Coins,
  Wallet,
  ArrowUp,
  Activity,
  ArrowDown,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Button } from "./_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./_components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./_components/ui/chart";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import DashboardTokens from "./_components/top-coins";
import TopNfts from "./_components/TopNfts";
import TokenHoldings from "./_components/TokenHoldins";
import { projects } from "@/constants/market";
import { isAddress } from "thirdweb";
import { getWalletBalance } from "thirdweb/wallets";
import { rootstackTestnetChain } from "@/constants/chains";
import { client } from "@/providers/thirdwebProvider";
import { ProjectCard } from "./_components/ProjectCard";

interface DashboardHeaderProps {
  totalValue: number;
  dailyChange: number;
  balance: string;
}

interface PortfolioData {
  month: string;
  netWorth: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalValue,
  dailyChange,
  balance,
}) => (
  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-200">
          Total Portfolio Value
        </CardTitle>
        <Wallet className="w-4 h-4 text-zinc-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {balance}
        </div>
        <div
          className={`flex items-center text-sm ${
            dailyChange >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {dailyChange >= 0 ? (
            <ArrowUp className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDown className="w-4 h-4 mr-1" />
          )}
          {Math.abs(dailyChange)}%
        </div>
      </CardContent>
    </Card>

    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-200">
          Active Positions
        </CardTitle>
        <Activity className="w-4 h-4 text-zinc-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">12</div>
        <p className="text-xs text-zinc-400">Across 4 protocols</p>
      </CardContent>
    </Card>

    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-200">
          Total Yield
        </CardTitle>
        <Coins className="w-4 h-4 text-zinc-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">$1.04</div>
        <p className="text-xs text-green-500">+5.23% APY</p>
      </CardContent>
    </Card>
  </div>
);

export default function Component() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [walletBalance, setWalletBalance] = useState<string>("0.0000 tRBTC");
  const account = useActiveAccount();

  const acc = account ? (isAddress(account.address) ? account.address : account.address) : undefined;

  const chartConfig = {
    netWorth: {
      label: "Net Worth",
      color: "hsl(var(--chart-1))",
    },
  };

  // Helper function to format blockchain values with 4 decimal places
  const formatBlockchainValue = (value: number | null | undefined): string => {
    if (!value || isNaN(value) || value === 0) {
      return "0.0000 tRBTC";
    }

    const tokenValue = value / 1e18;

    if (tokenValue >= 1e6) {
      return `${(tokenValue / 1e6).toFixed(4)}M tRBTC`;
    } else if (tokenValue >= 1e3) {
      return `${(tokenValue / 1e3).toFixed(4)}K tRBTC`;
    } else if (tokenValue >= 1) {
      return `${tokenValue.toFixed(4)} tRBTC`;
    } else if (tokenValue > 0) {
      return tokenValue < 0.0001
        ? `${tokenValue.toExponential(4)} tRBTC`
        : `${tokenValue.toFixed(4)} tRBTC`;
    }
    return "0.0000 tRBTC";
  };

  // Fetch wallet balance
  useEffect(() => {
    async function fetchBalance() {
      if (!acc) return;
      
      try {
        const balance = await getWalletBalance({
          address: acc,
          client,
          chain: rootstackTestnetChain,
        });

        const formattedBalance = formatBlockchainValue(Number(balance.value));
        setWalletBalance(formattedBalance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance("0.0000 tRBTC");
      }
    }

    fetchBalance();
  }, [acc]);

  // Fetch portfolio data
  useEffect(() => {
    async function fetchData() {
      if (!acc) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://rootstock-testnet.blockscout.com/api/v2/addresses/${acc}/coin-balance-history-by-day`
        );
        const { items } = await response.json();

        const formattedData: PortfolioData[] =
          items && Array.isArray(items) && items.length > 0
            ? items.map((item: any) => ({
                month: new Date(item.date).toLocaleString(
                  "default",
                  { month: "short" }
                ),
                netWorth: Number(item.value) || 0,
              }))
            : [
                { month: "Jan", netWorth: 0 },
                { month: "Feb", netWorth: 0 },
                { month: "Mar", netWorth: 0 },
                { month: "Apr", netWorth: 0 },
                { month: "May", netWorth: 0 },
                { month: "Jun", netWorth: 0 },
              ];

        setPortfolioData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setPortfolioData([
          { month: "Jan", netWorth: 0 },
          { month: "Feb", netWorth: 0 },
          { month: "Mar", netWorth: 0 },
          { month: "Apr", netWorth: 0 },
          { month: "May", netWorth: 0 },
          { month: "Jun", netWorth: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [acc]);

  return (
    <div className="p-6 space-y-6 min-h-screen text-white">
      <DashboardHeader
        totalValue={
          portfolioData.length > 0
            ? Number(portfolioData[portfolioData.length - 1].netWorth) / 1e18
            : 0
        }
        dailyChange={0}
        balance={walletBalance}
      />
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-transparent border-zinc-800 col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Total Net Worth (tRBTC)
            </CardTitle>
            <CardDescription className="text-slate-100">
              Showing net worth for the last few months
            </CardDescription>
          </CardHeader>
          <CardContent className="my-4">
            <ChartContainer
              config={chartConfig}
              className="h-[310px] w-full text-white"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2
                    className="animate-spin text-[#FF9100]"
                    size={48}
                  />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioData}>
                    <CartesianGrid
                      vertical={false}
                      stroke="#333"
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                      stroke="#fff"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={formatBlockchainValue}
                      stroke="#fff"
                      width={120}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          hideLabel
                          className="text-white"
                          formatter={(value) => [
                            formatBlockchainValue(Number(value)),
                            "Net Worth"
                          ]}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      fill="#FF9100"
                      fillOpacity={0.4}
                      stroke="#FF9100"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
        <TokenHoldings />
      </div>

      <DashboardTokens />
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">
            Trending Protocols
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </CardContent>
      </Card>

      <TopNfts />
    </div>
  );
}