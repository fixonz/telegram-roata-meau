import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, AlertTriangle } from "lucide-react"

export function RulesSection() {
  return (
    <Card className="bg-gray-900/50 border-gray-800 w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Reguli Joc
        </CardTitle>
        <CardDescription>Regulile pentru O Gheara la Miau</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Cum funcționează:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-400">
            <li>Fiecare rotire costă o sumă fixă de LTC (sau este gratuită dacă ai free spins).</li>
            <li>Poți câștiga premii, bonusuri sau rotiri gratuite la fiecare rotire.</li>
            <li>Premiile sunt distribuite aleatoriu, pe baza probabilităților afișate.</li>
            <li>Toate câștigurile și pierderile sunt înregistrate în portofelul tău.</li>
            <li>Depozitele sunt creditate după confirmarea pe blockchain.</li>
            <li>Adminii gestionează retragerile și premiile mari.</li>
          </ul>
          <div className="flex items-center gap-2 mt-4 p-2 bg-yellow-900/20 border border-yellow-700 rounded">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-yellow-200">Joacă responsabil! Nu paria mai mult decât îți permiți să pierzi.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
