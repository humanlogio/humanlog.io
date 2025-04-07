import DatePicker from "@/components/ui/graph/datePicker";
import dayjs from "dayjs";

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
    <div className="ml-[40px] flex w-max items-center rounded-lg p-1">
      <DatePicker
        styles="block w-full border text-sm"
        hideDate={sameDate}
        date={dateFrom}
        minDate={dayjs().subtract(1, "year").toDate()}
        maxDate={dateTo as Date}
        setDate={setDateFrom}
      />

      <span className="px-2 text-sm">to</span>

      <DatePicker
        styles="block w-full border text-sm"
        hideDate={sameDate}
        date={dateTo}
        minDate={dateFrom}
        maxDate={dayjs().toDate()}
        setDate={setDateTo}
      />
    </div>
  );
};

export default DateRangePicker;
