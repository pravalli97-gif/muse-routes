import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { immersiveExperiences } from "@/lib/immersive-experiences";

const ImmersiveExperiences = () => {
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  const generateRandomDate = () => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 10) + 1);
    return futureDate.toDateString();
  };

  const generateRandomFrequency = () => {
    return `every ${Math.floor(Math.random() * 6) + 5} days`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Immersive Experiences</h1>
      <Select onValueChange={setSelectedPlace}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a place" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="goa">Goa</SelectItem>
          <SelectItem value="paris">Paris</SelectItem>
          <SelectItem value="iceland">Iceland</SelectItem>
          <SelectItem value="varkala">Varkala</SelectItem>
          <SelectItem value="montreal">Montreal</SelectItem>
        </SelectContent>
      </Select>

      {selectedPlace && (
        <div className="mt-6">
          <Tabs defaultValue="0">
            <TabsList>
              {immersiveExperiences[
                selectedPlace as keyof typeof immersiveExperiences
              ]?.tabs.map((tab, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {immersiveExperiences[
              selectedPlace as keyof typeof immersiveExperiences
            ]?.tabs.map((tab, index) => (
              <TabsContent key={index} value={index.toString()}>
                <Card>
                  <CardHeader>
                    <CardTitle>{tab.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{tab.content}</p>
                    <p className="mt-4">
                      <strong>Next available:</strong> {generateRandomDate()}
                    </p>
                    <p>
                      <strong>Occurs:</strong> {generateRandomFrequency()}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ImmersiveExperiences;
