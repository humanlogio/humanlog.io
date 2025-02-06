import DatePicker from "@/components/ui/graph/datePicker";

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
    <div className="ml-[40px] flex w-max items-center rounded-lg border bg-slate-200 p-1 dark:border-darkBorder dark:bg-darkBg dark:text-darkText">
      <DatePicker
        styles="block w-full border text-sm"
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

      <span className="px-2 text-sm">to</span>

      <DatePicker
        styles="block w-full border text-sm"
        hideDate={sameDate}
        date={dateTo}
        minDate={new Date(dateFrom.getTime() + 1000)} // add one hour
        setDate={setDateTo}
      />
    </div>
  );
};

export default DateRangePicker;
