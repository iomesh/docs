---
id: uninstall-cluster
title: Uninstall Cluster
sidebar_label: Uninstall Cluster
---

>_ATTENTION_: After uninstalling the IOMesh cluster, all data will be lost including all PVCs in the IOMesh cluster.

To uninstall the IOMesh cluster, run the following command:

```shell
helm uninstall --namespace iomesh-system iomesh
```

If there are IOMesh resources left after uninstalling IOMesh due to network or other issues, run the following command to delete all IOMesh resources.
```shell
`curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -` 
```


