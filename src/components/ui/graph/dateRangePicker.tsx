import DatePicker from "@/components/ui/graph//datePicker";

const DateRangePicker = (props: {
  dateFrom: Date;
  dateTo: Date | null;
  setDateFrom: (date: Date) => void;
  setDateTo: (date: Date) => void;
}) => {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = props;

  const sameDate =
    (dateTo &&
      dateFrom.getFullYear() === dateTo.getFullYear() &&
      dateFrom.getMonth() === dateTo.getMonth() &&
      dateFrom.getDate() === dateTo.getDate()) ||
    false;

  return (
    <div className="mx-auto flex w-max items-center rounded-[0.425rem] border bg-slate-200 dark:border-darkBorder dark:bg-darkBg dark:text-darkText">
      <div className="relative w-full">
        <DatePicker
          styles="block w-full rounded-md border border-slate-300 py-1.5 px-2.5 text-xs ring-2 focus:border-blue-500 focus:ring-blue-500 lg:p-2.5 lg:text-sm"
          hideDate={sameDate}
          date={dateFrom}
          maxDate={
            new Date(
              new Date(
                Math.min(
                  dateTo?.getTime() ?? new Date().getTime(),
                  new Date().getTime(),
                ),
              ).getTime() - 1000,
            )
          } // sub one hour
          setDate={setDateFrom}
        />
      </div>

      <div className="px-2">to</div>

      <div className="relative w-full">
        <DatePicker
          styles="block w-full rounded-md border border-slate-300 py-1.5 px-2.5 text-xs ring-2 focus:border-blue-500 focus:ring-blue-500 lg:p-2.5 lg:text-sm"
          hideDate={sameDate}
          date={dateTo}
          minDate={new Date(dateFrom.getTime() + 1000)} // add one hour
          setDate={setDateTo}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
