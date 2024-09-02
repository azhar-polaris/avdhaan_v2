import { useCallback } from "react";
import SubmitButton from "@/components/customUI/Button/SubmitButton";
import { convertHesFiltersToSearchParams } from "@/lib/hes";
import useHesPrimaryFilterState from "@/hooks/hes/useHesPrimaryFilterState";
import { useSearchParams } from "react-router-dom";
import PrimaryFilters from "./PrimaryFilters";

const HesFilters = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ _, setSearchParams ] = useSearchParams();

    const {
        primaryFilters,
        setPrimaryFilters
    } = useHesPrimaryFilterState();

    const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newParams = convertHesFiltersToSearchParams(primaryFilters);
        setSearchParams(newParams);
    }, [primaryFilters, setSearchParams]);

    return (
        <form
            className="p-5 rounded-lg bg-white my-3 flex-1 flex flex-wrap gap-x-5 gap-y-5"
            onSubmit={handleSubmit}
        >
            <PrimaryFilters 
                primaryFilters={primaryFilters} 
                setPrimaryFilters={setPrimaryFilters} 
            />
            
            <SubmitButton title="Search" />
        </form>
    )
}

export default HesFilters