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

如果由于网络或者其他原因导致 IOMesh 卸载后有 IOMesh 资源残留，可以使用命令 `curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -` 删除所有 IOMesh 资源
