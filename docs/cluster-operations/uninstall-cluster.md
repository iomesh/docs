---
id: uninstall-cluster
title: Uninstalling IOMesh Cluster
sidebar_label: Uninstalling IOMesh Cluster
---

>**Attention**: After uninstalling the IOMesh cluster, all data will be lost, including all PVCs in the IOMesh cluster.

To uninstall the IOMesh cluster, run the following command:

```shell
helm uninstall --namespace iomesh-system iomesh
```
