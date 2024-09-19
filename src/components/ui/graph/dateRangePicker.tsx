import DatePicker from "./datePicker";

const DateRangePicker = (props: { dateFrom?: Date; dateTo?: Date }) => {
  const { dateFrom, dateTo } = props;

  return (
    <div className="mx-auto flex w-max items-center rounded-[0.425rem] border bg-slate-200">
      <div className="relative w-full">
        <DatePicker
          styles="block w-full rounded-md border border-slate-300 py-1.5 px-2.5 text-xs text-slate-900 ring-2 focus:border-blue-500 focus:ring-blue-500 lg:p-2.5 lg:text-sm"
          includeTime={false}
          date={dateFrom}
        />
      </div>

      <div className="px-2">to</div>

      <div className="relative w-full">
        <DatePicker
          styles="block w-full rounded-md border border-slate-300 py-1.5 px-2.5 text-xs text-slate-900 ring-2 focus:border-blue-500 focus:ring-blue-500 lg:p-2.5 lg:text-sm"
          includeTime={false}
          date={dateTo}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
