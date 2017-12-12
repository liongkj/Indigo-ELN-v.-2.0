package com.epam.indigoeln.core.chemistry.experiment.businessmodel.stoichiometry;

import com.epam.indigoeln.core.chemistry.domain.StoicModelInterface;

import java.io.Serializable;
import java.util.Comparator;

public class ComparatorStoicAdditionOrder implements Comparator<StoicModelInterface>, Serializable {

    private static final long serialVersionUID = 8301635693659204235L;

    public ComparatorStoicAdditionOrder() {
        super();
    }

    public int compare(StoicModelInterface o1, StoicModelInterface o2) {
        int result = 0;
        if (o1 != null) {
            result = 1;
            if (o2 != null) {
                result = o1.getStoicTransactionOrder() - o2.getStoicTransactionOrder();
            }
        } else if (o2 != null)
            result = -1;

        return result;
    }
}