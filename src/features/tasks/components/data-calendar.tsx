import { Task } from "../types";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { enUS } from "date-fns/locale";
import {
  format,
  startOfWeek,
  getDay,
  parse,
  subMonths,
  addMonths,
} from "date-fns";
import { useState } from "react";

import { EvenCard } from "./even-card";
import { CustomToolbar } from "./custom-toolbar";

const locales = {
  en: enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type DataCalendarProps = {
  data: Task[];
};

export function DataCalendar({ data }: DataCalendarProps) {
  const [value, setValue] = useState(
    data.length > 0 ? new Date(data[0].dueDate) : new Date()
  );

  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task.$id,
  }));

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    switch (action) {
      case "PREV":
        setValue(subMonths(value, 1));
        break;
      case "NEXT":
        setValue(addMonths(value, 1));
        break;
      case "TODAY":
        setValue(new Date());
        break;
    }
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      views={["month"]}
      defaultView="month"
      date={value}
      toolbar
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{
        eventWrapper: ({ event }) => {
          return (
            <EvenCard
              id={event.id}
              title={event.title}
              assignee={event.assignee}
              project={event.project}
              status={event.status}
            />
          );
        },
        toolbar: () => {
          return <CustomToolbar date={value} onNavigate={handleNavigate} />;
        },
      }}
    />
  );
}
