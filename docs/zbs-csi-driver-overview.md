---
id: zbs-csi-driver-overview
title: ZBS CSI Driver Overview
sidebar_label: Overview
---

The ZBS Container Storage Interface (CSI) Driver provides a [CSI](https://github.com/container-storage-interface/spec/blob/master/spec.md) interface used by Container Orchestrators to manage the lifecycle of ZBS volumes.

## Features

- **[Raw Block Volume](https://kubernetes-csi.github.io/docs/raw-block.html)** - The corresponding CSI feature (`CSIBlockVolume`) is GA since Kubernetes 1.18.
- **[Volume Snapshot](https://kubernetes-csi.github.io/docs/snapshot-restore-feature.html)** - creating volume snapshots and restore volume from snapshot. The corresponding CSI feature (`VolumeSnapshotDataSource`) is beta since Kubernetes 1.17.
- **[Volume Cloning](https://kubernetes-csi.github.io/docs/volume-cloning.html)** - cloning from  a exist volume. The corresponding CSI feature (`VolumeContentSourceVolume`) is GA since Kubernetes 1.18.
- **[Volume Expandsion](https://kubernetes-csi.github.io/docs/volume-expansion.html)** - expand the volume size. The corresponding CSI feature (`ExpandCSIVolumes`) is beta since Kubernetes 1.16.

### Access Mode

We support Mount Volume (Filesystem Volume) and Block Volume. Their supported access modes are as follows.

| Access Mode \ Volume Mode | Mount Volume | Block Volume |
| ------------------------- | ------------ | ------------ |
| SINGLE_NODE_READER_ONLY   | yes          | yes          |
| SINGLE_NODE_WRITER        | yes          | yes          |
| MULTI_NODE_MULTI_WRITER   | no           | yes          |
| MULTI_NODE_READER_ONLY    | no           | yes          |
| MULTI_NODE_SINGLE_WRITER  | no           | yes          |

### StorageClass Parameters

StorageClass have parameters that describe volumes belonging to the StorageClass.
| Parameters                | Values                        | Default | Description                       |
| ------------------------- | ----------------------------- | ------- | --------------------------------- |
| csi.storage.k8s.io/fstype | "xfs", "ext2", "ext3", "ext4" | "ext4"  | volume File system type           |
| replicaFactor             | "1", "2", "3"                 | "2"     | replica factor                    |
| thinProvision             | "true", "false"               | "true"  | thin provision or thick provision |

```yaml
# Declare StorageClass with parameters
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: example-sc
# zbs-csi-driver name
provisioner: zbs-csi-driver.iomesh.com
parameters:
  csi.storage.k8s.io/fstype: "ext4"
  replicaFactor: "1"
  thinProvision: "true"
reclaimPolicy: Retain
allowVolumeExpansion: true
volumeBindingMode: Immediate
---
# Declare pvc with StorageClass example-sc.
# Then get a file system of ext4, single replica, thin provisioned volume.
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: example-sc
```

> **_Note:_ These parameters will be passed to  `CreateVolumeRequest.parameters` map**

## Kubernetes Version Compatibility Matrix

| ZBS CSI Driver \ Kubernetes Version                                                                                                                              | v1.17 | v1.18 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- |
| [v0.1.1](https://hub.docker.com/layers/iomesh/zbs-csi-driver/v0.1.1/images/sha256-7774ae7e373761af8c6e893ebd8d1838d38052a19e08a8df295c3f38a86be42d?context=repo) | yes   | yes   |
