---
id: setup-storageclass
title: Setup StorageClass
sidebar_label: Setup StorageClass
---

The IOMesh storage class parameters are:

| Parameters                | Values                        | Default | Description                        |
| ------------------------- | ----------------------------- | ------- | ---------------------------------- |
| csi.storage.k8s.io/fstype | "xfs", "ext2", "ext3", "ext4" | "ext4"  | volume File system type            |
| replicaFactor             | "1", "2", "3"                 | "2"     | replica factor                     |
| thinProvision             | "true", "false"               | "true"  | thin provision or thick provision. |

After IOMesh CSI driver was installed, a default StorageClass `iomesh-csi-driver-default` would be created. You may also create a new StorageClass with customized parameters:


```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: my-iomesh-csi-driver-default
provisioner: com.iomesh.csi-driver # <-- driver.name in iomesh-values.yaml
reclaimPolicy: Retain
allowVolumeExpansion: true
parameters:
  # "ext4" / "ext3" / "ext2" / "xfs"
  csi.storage.k8s.io/fstype: "ext4"
  # "1" / "2" / "3"
  replicaFactor: "2"
  # "true" / "false"
  thinProvision: "true"
volumeBindingMode: Immediate
```
