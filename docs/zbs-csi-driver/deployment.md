---
id: deployment
title: ZBS CSI Driver Deployment
sidebar_label: Deployment
---

This topic explains how to install ZBS CSI Driver with kubernetes. Follow the steps in this topic in order.

## Supported platforms

- Kubernetes node Linux distro: CentOS 7 and CentOS 8
- Kubernetes v1.17 or higher
- Openshift v3.11 or higher
- ZBS v4.0.7-rc16 (corresponding SMTX OS version: SMTXOS-4.0.7-CSI-solution-el7)
- Helm v3.3.x

## Setup Kubernetes

### Enable Kubernetes features

Enable the CSI related features to ensure that the driver works normally.

After a feature is GA, the feature gate will be removed in the next few versions. Please refer to **[feature-gates](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/)** to selectively enable features.

| Feature Gate                 | Default | Stage | Since | Until |
| ---------------------------- | ------- | ----- | ----- | ----- |
| CSINodeInfo                  | false   | Alpha | 1.12  | 1.13  |
| CSINodeInfo                  | true    | Beta  | 1.14  | 1.16  |
| CSINodeInfo                  | true    | GA    | 1.17  | -     |
| CSIDriverRegistry            | false   | Alpha | 1.12  | 1.13  |
| CSIDriverRegistry            | true    | Beta  | 1.14  | 1.16  |
| CSIDriverRegistry            | true    | GA    | 1.17  | -     |
| VolumeSnapshotDataSource     | false   | Alpha | 1.12  | 1.16  |
| VolumeSnapshotDataSource     | true    | Beta  | 1.17  | -     |
| VolumePVCDataSource          | false   | Alpha | 1.15  | 1.15  |
| VolumePVCDataSource          | true    | Beta  | 1.16  | 1.17  |
| VolumePVCDataSource          | true    | GA    | 1.18  | -     |
| ExpandCSIVolumes             | false   | Alpha | 1.14  | 1.15  |
| ExpandCSIVolumes             | true    | Beta  | 1.16  | -     |
| CSIBlockVolume               | false   | Alpha | 1.11  | 1.13  |
| CSIBlockVolume               | true    | Beta  | 1.14  | 1.17  |
| CSIBlockVolume               | true    | GA    | 1.18  | -     |
| ExpandInUsePersistentVolumes | false   | Beta  | 1.11  | 1.14  |
| ExpandInUsePersistentVolumes | true    | Beta  | 1.15  | -     |

For Kubernetes 1.17+, we can open all feature gates. Different Kubernetes clusters may have different ways of configuration. Here we assume the cluster is deployed by `kubeadm`.

1. Enable feature gates on each `kube-apiserver`: `--feature-gates=CSINodeInfo=true,CSIDriverRegistry=true,CSIBlockVolume=true,VolumeSnapshotDataSource=true,VolumePVCDataSource=true,ExpandCSIVolumes=true,ExpandInUsePersistentVolumes=true` and `--allow-privileged=true`

```yaml
# /etc/kubernetes/manifests/kube-apiserver.yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - command:
    - kube-apiserver
    # enable feature-gates here
    - --feature-gates=CSINodeInfo=true,CSIDriverRegistry=true,CSIBlockVolume=true,VolumeSnapshotDataSource=true,VolumePVCDataSource=true,ExpandCSIVolumes=true,ExpandInUsePersistentVolumes=true
    # enable privileged here
    - --allow-privileged=true
```

2. Enable feature gates on each `kubelet`: `--feature-gates=CSINodeInfo=true,CSIDriverRegistry=true,CSIBlockVolume=true,VolumeSnapshotDataSource=true,VolumePVCDataSource=true,ExpandCSIVolumes=true,ExpandInUsePersistentVolumes=true`.

```yaml
# /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf
# Note: This dropin only works with kubeadm and kubelet v1.11+
[Service]
# enable feature-gates here
Environment="KUBELET_KUBECONFIG_ARGS=--bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf --kubeconfig=/etc/kubernetes/kubelet.conf --feature-gates=CSINodeInfo=true,CSIDriverRegistry=true,CSIBlockVolume=true,VolumeSnapshotDataSource=true,VolumePVCDataSource=true,ExpandCSIVolumes=true,ExpandInUsePersistentVolumes=true"
Environment="KUBELET_CONFIG_ARGS=--config=/var/lib/kubelet/config.yaml"
# This is a file that "kubeadm init" and "kubeadm join" generates at runtime, populating the KUBELET_KUBEADM_ARGS variable dynamically
EnvironmentFile=-/var/lib/kubelet/kubeadm-flags.env
# This is a file that the user can use for overrides of the kubelet args as a last resort. Preferably, the user should use
# the .NodeRegistration.KubeletExtraArgs object in the configuration files instead. KUBELET_EXTRA_ARGS should be sourced from this file.
EnvironmentFile=-/etc/sysconfig/kubelet
ExecStart=
ExecStart=/usr/bin/kubelet $KUBELET_KUBECONFIG_ARGS $KUBELET_CONFIG_ARGS $KUBELET_KUBEADM_ARGS $KUBELET_EXTRA_ARGS
```

3. Reload Config

```shell
systemctl daemon-reload
systemctl restart kubelet
```

4. Wait until kubelet and kube-apiserver ready

```shell
systemctl status kubelet
```

```output
● kubelet.service - kubelet: The Kubernetes Node Agent
   Loaded: loaded (/usr/lib/systemd/system/kubelet.service; enabled; vendor preset: disabled)
  Drop-In: /usr/lib/systemd/system/kubelet.service.d
           └─10-kubeadm.conf
   Active: active (running) since Mon 2020-09-23 14:36:18 CST;
```

```shell
kubectl wait --for=condition=Ready  pod/kube-apiserver-<suffix> -n kube-system
```

```output
pod/kube-apiserver-<suffix> condition met
```
> **_Note:_ If you use openshift4.5 or highter, the Kubernetes version in openshift is KubernetesV1.18 or highter, all feature are opened default.**

### Deploy Common Snapshot Controller
> **_Note:_ Only for `Kubernetes >= v1.13.0` or `Openshift >= v4.0`**

The volume snapshot controller management is similar to pv/pvc controller, it manages the snapshot CRDs.
Regardless of the number CSI drivers deployed on the cluster, there must be only one instance of the volume snapshot controller running and one set of volume snapshot CRDs installed per cluster.

1. Download **[external-controller repo](https://github.com/kubernetes-csi/external-snapshotter/tree/release-2.1)**

```shell
curl -LO https://github.com/kubernetes-csi/external-snapshotter/archive/release-2.1.zip
unzip release-2.1.zip && cd external-snapshotter-release-2.1
```

2. Create Snapshot Beta CRD

```shell
kubectl create -f ./config/crd
```

3. Install Common Snapshot Controller

```shell
kubectl apply -f ./deploy/kubernetes/snapshot-controller
```

> **_Note:_ replace with the snapshot-controller's namespace, e.g. kube-system**

4. Verify

```shell
kubectl get statefulset  snapshot-controller -n <your-namespace>
```

```output
NAME                  READY   AGE
snapshot-controller   1/1     32s
```

## Setup ZBS Cluster

1. Ensure that the kubernetes cluster can connect with the ZBS cluster's access network

2. Configure `zbs-cluster-vip` in the access network segment

```shell
zbs-task vip set iscsi <zbs-cluster-vip>
```

## Setup open-iscsi

1. Install `iscsi-initiator-utils` on each kubernetes node

```shell
yum install iscsi-initiator-utils
```

2. Ensure that the node.startup option of `/etc/iscsi/iscsid.conf` is manual

```shell
sed -i 's/^node.startup = automatic$/node.startup = manual/' /etc/iscsi/iscsid.conf
```

3. Disable selinux

```shell
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

4. Enable and start `iscsid`

```shell
systemctl enable --now iscsid
```

## Setup Helm

Please refer to **[Install Helm](https://helm.sh/docs/intro/install/)**.

> **_Note_: If Helm is not allowed, please install it locally.**

## Deploy zbs-csi-driver

1. When multiple kubernetes clusters or other platforms (eg. openstack, esxi) share a ZBS cluster, each kubernetes cluster needs to be assigned a unique `kubernetes-cluster-id`. The `kubernetes-cluster-id` should not be changed once assigned.

> **_Note:_ The `kubernetes-cluster-id` cloud be kubernetes cluster name or kubernetes cluster id. The `kubernetes-cluster-id` can be obtained from the kubernetes cluster management platform(eg. eks) or the cluster administrator can specify a string of length less than 255.**

2. Create Namespace

```shell
kubectl create namespace iomesh-system
```

3. Add Helm repo

```shell
helm repo add iomesh http://iomesh.com/charts
```

4. Deploy Driver

Get values.yaml from chart

<!--DOCUSAURUS_CODE_TABS-->

<!--Kubernetes >= v1.13.0 / Openshift v4.0-->
```shell
helm show values iomesh/zbs-csi-driver --version 0.1.2 > values.yaml
```

<!--Openshift v3.11-->
```shell
helm show values iomesh/zbs-csi-driver-ocp --version 0.1.1 > values.yaml
```

<!--END_DOCUSAURUS_CODE_TABS-->

Configure the blank items in the driver section in values.yaml

<!--DOCUSAURUS_CODE_TABS-->

<!-- Kubernetes >= v1.13-->
```yaml
# values.yaml
# Default values for zbs-csi-driver.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.
# If set resouce's name will be release-name-<nameOverride>
nameOverride: ""
# If set resouce's name will be <fullnameOverride>
fullnameOverride: ""

rbac:
  # Create ClusterRole
  create: true

serviceAccount:
  # Specifies whether a service account should be created
  create: true

# Container Orchestration system (eg. "kubernetes"/"openshift" )
co: "kubernetes"
coVersion: ""

driver:
  # The unique csi driver name in a kubernetes cluster
  name:
  # kubernetes-cluster-id
  clusterID:
  # EXTERNAL / HCI
  deploymentMode:
  # meta proxy (eg. `zbs-cluster-vip:10206` )
  metaProxy:
  # iscsi portal (eg. EXTERNAL: `zbs-cluster-vip:3260`, HCI: `127.0.0.1:3260` )
  # Note that the iscsi portal is a vip, please do not modify it once assigned.
  iscsiPortal:
  # CentOS7 / CentOS8 / CoreOS
  linuxDistro:

  controller:
    # controller replicas
    replicas: 3
    # use hostNetwork to access zbs cluster
    hostNetwork: true
    driver:
      # driver ports(If hostNetwork is true, ports are host ports)
      ports:
        # csi health port
        health: 9810

  node:
    driver:
      # host ports
      ports:
        # csi health port
        health: 9811
        # node plugin liveness port
        liveness: 9812

  images:
    driver:
      repository: iomesh/zbs-csi-driver
      tag: v2.0.0
      pullPolicy: IfNotPresent
    registrar:
      repository: quay.io/k8scsi/csi-node-driver-registrar
      tag: v1.0.2
      pullPolicy: IfNotPresent
    livenessprobe:
      repository: quay.io/k8scsi/livenessprobe
      tag: v1.1.0
      pullPolicy: IfNotPresent
    snapshotter:
      repository: quay.io/k8scsi/csi-snapshotter
      tag: v2.1.1
      pullPolicy: IfNotPresent
    provisioner:
      repository: quay.io/k8scsi/csi-provisioner
      tag: v1.6.0
      pullPolicy: IfNotPresent
    attacher:
      repository: quay.io/k8scsi/csi-attacher
      tag: v2.2.0
      pullPolicy: IfNotPresent
    resizer:
      repository: quay.io/k8scsi/csi-resizer
      tag: v0.5.0
      pullPolicy: IfNotPresent
```

<!--Openshift >= v4.0-->
```yaml
# values.yaml
# Default values for zbs-csi-driver.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.
# If set resouce's name will be release-name-<nameOverride>
nameOverride: ""
# If set resouce's name will be <fullnameOverride>
fullnameOverride: ""

rbac:
  # Create ClusterRole
  create: true

serviceAccount:
  # Specifies whether a service account should be created
  create: true

# Container Orchestration system (eg. "kubernetes"/"openshift" )
co: "openshift"
coVersion: ""

driver:
  # The unique csi driver name in a kubernetes cluster
  name:
  # kubernetes-cluster-id
  clusterID:
  # EXTERNAL / HCI
  deploymentMode:
  # meta proxy (eg. `zbs-cluster-vip:10206` )
  metaProxy:
  # iscsi portal (eg. EXTERNAL: `zbs-cluster-vip:3260`, HCI: `127.0.0.1:3260` )
  # Note that the iscsi portal is a vip, please do not modify it once assigned.
  iscsiPortal:
  # CentOS7 / CentOS8 / CoreOS
  linuxDistro:

  controller:
    # controller replicas
    replicas: 3
    # use hostNetwork to access zbs cluster
    hostNetwork: true
    driver:
      # driver ports(If hostNetwork is true, ports are host ports)
      ports:
        # csi health port
        health: 9810

  node:
    driver:
      # host ports
      ports:
        # csi health port
        health: 9811
        # node plugin liveness port
        liveness: 9812

  images:
    driver:
      repository: iomesh/zbs-csi-driver
      tag: v2.0.0
      pullPolicy: IfNotPresent
    registrar:
      repository: quay.io/k8scsi/csi-node-driver-registrar
      tag: v1.0.2
      pullPolicy: IfNotPresent
    livenessprobe:
      repository: quay.io/k8scsi/livenessprobe
      tag: v1.1.0
      pullPolicy: IfNotPresent
    snapshotter:
      repository: quay.io/k8scsi/csi-snapshotter
      tag: v2.1.1
      pullPolicy: IfNotPresent
    provisioner:
      repository: quay.io/k8scsi/csi-provisioner
      tag: v1.6.0
      pullPolicy: IfNotPresent
    attacher:
      repository: quay.io/k8scsi/csi-attacher
      tag: v2.2.0
      pullPolicy: IfNotPresent
    resizer:
      repository: quay.io/k8scsi/csi-resizer
      tag: v0.5.0
      pullPolicy: IfNotPresent
```

> **_Note:_ If you use openshift config, The installation process will automatically create a Security Context Constraints named scc-zbs-csi-driver, which is used to allow all zbs-csi related containers to become Privileged Containers to provide storage-related functions**

<!-- Openshift v3.11 -->

```yaml
# Default values for zbs-csi-driver.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.
nameOverride: ""
fullnameOverride: ""

rbac:
  create: true  

serviceAccount:
  # Specifies whether a service account should be created
  create: true

# Container Orchestration system (eg. "kubernetes"/"openshift" )
co: "openshift"
coVersion: "3.11"

driver:
  # The unique csi driver name in a kubernetes cluster
  name:
  # kubernetes-cluster-id
  clusterID:
  # meta proxy (eg. `zbs-cluster-vip:10206` )
  metaProxy:
  # iscsi portal (eg. EXTERNAL: `zbs-cluster-vip:3260`, HCI: `127.0.0.1:3260` )
  iscsiPortal:
  # CentOS7 / CentOS8
  linuxDistro:
  # EXTERNAL / HCI
  deploymentMode:

  controller:
    # controller replicas
    replicas: 3
    # use hostNetwork to access zbs cluster
    hostNetwork: true
    driver:
      # driver ports(If hostNetwork is true, ports are host ports)
      ports:
        health: 9810

  node:
    driver:
      # iscsi config
      iscsi: {}
        # node.session.queue_depth: 128
        # node.session.cmds_max: 128
        # node.session.timeo.replacement_timeout: 120
      # host ports
      ports:
        health: 9811
        liveness: 9812

  images:
    driver:
      repository: iomesh/zbs-csi-driver
      tag: v2.0.0-ocp311
      pullPolicy: IfNotPresent
    registrar:
      repository: quay.io/k8scsi/driver-registrar
      tag: v0.4.2
      pullPolicy: IfNotPresent
    livenessprobe:
      repository: iomesh/csi-livenessprobe
      tag: v0.4.2
      pullPolicy: IfNotPresent
    provisioner:
      repository: quay.io/k8scsi/csi-provisioner
      tag: v0.4.2
      pullPolicy: IfNotPresent
```

> **_Note:_ If you use openshift config, The installation process will automatically create a Security Context Constraints named scc-zbs-csi-driver, which is used to allow all zbs-csi related containers to become Privileged Containers to provide storage-related functions**

<!--END_DOCUSAURUS_CODE_TABS-->

> **_Note:_ If you need to use different zbs cluster storage in the same kubernetes cluster, please deploy multiple sets of zbs-csi-drivers with different driver names,  meta proxys and iscsi portals to ensure that the csi drivers are different. Additionally, it necessary to avoid conflicts between `driver.controller.ports` and `driver.node.ports` of different zbs-csi-drivers.**

Install zbs-csi-driver

<!--DOCUSAURUS_CODE_TABS-->
<!--Kubernetes >= v1.13.0 / Openshift v4.0-->
```shell
helm install -f ./values.yaml --namespace iomesh-system <release-name> iomesh/zbs-csi-driver --version 0.1.2
```
<!--Openshift v3.11-->
```shell
helm install -f ./values.yaml --namespace iomesh-system <release-name> iomesh/zbs-csi-driver-ocp --version 0.1.1
```
<!--END_DOCUSAURUS_CODE_TABS-->


If Helm is not allowed, please install it locally. Then use Helm to generate driver.yaml.
<!--DOCUSAURUS_CODE_TABS-->
<!--Kubernetes >= v1.13.0 / Openshift v4.0-->
```shell
helm template -f ./values.yaml --release-name <release-name> --namespace iomesh-system  iomesh/zbs-csi-driver --version 0.1.2 > driver.yaml
```
<!--Openshift v3.11-->
```shell
helm template -f ./values.yaml --release-name <release-name> --namespace iomesh-system  iomesh/zbs-csi-driver-ocp --version 0.1.1 > driver.yaml
```
<!--END_DOCUSAURUS_CODE_TABS-->

Copy driver.yaml to the target server and apply it.

```shell
kubectl apply -f driver.yaml
```

5. Wait for ready

```shell
kubectl get pod -n iomesh-system
```

```output
NAME                                                READY   STATUS    RESTARTS   AGE
zbs-csi-driver-controller-plugin-5dbfb48d5c-2sk97   6/6     Running   0          42s
zbs-csi-driver-controller-plugin-5dbfb48d5c-cfhwt   6/6     Running   0          42s
zbs-csi-driver-controller-plugin-5dbfb48d5c-drl7s   6/6     Running   0          42s
zbs-csi-driver-node-plugin-25585                    3/3     Running   0          39s
zbs-csi-driver-node-plugin-fscsp                    3/3     Running   0          30s
zbs-csi-driver-node-plugin-g4c4v                    3/3     Running   0          39s
```

6. Setup StorageClass

```yaml
# storageclass.yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: zbs-csi-driver-default
# driver.name in values.yaml
provisioner: <driver.name>
# Delete / Retain
reclaimPolicy: Retain
allowVolumeExpansion: true
parameters:
  # "ext4" / "ext3" / "ext2" / "xfs"
  csi.storage.k8s.io/fstype: "ext4"
  # "1" / "2" / "3"
  replicaFactor: "1"
  # "true" / "false"
  thinProvision: "true"
```

```shell
kubectl apply -f storageclass.yaml
```

7. Setup SnapshotClass
> **_Note:_ Only for `Kubernetes >= v1.13.0` or `Openshift >= v4.0`**

```yaml
# snapshotclass.yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: zbs-csi-driver-default
# driver.name in values.yaml
driver: <dirver.name>
# Delete / Retain
deletionPolicy: Retain
```

```shell
kubectl apply -f snapshotclass.yaml
```

## Example

### Fio
1. Install Fio testing pod

```shell
kubectl apply -f http://www.iomesh.com/docs/assets/zbs-csi-driver/example/fio.yaml
```

2. Wait until fio-pvc bound and fio pod ready

```shell
kubectl get pvc fio-pvc
```

```output
NAME      STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             AGE
fio-pvc   Bound    pvc-d7916b34-50cd-49bd-86f9-5287db1265cb   30Gi       RWO            zbs-csi-driver-default   15s
```

```shell
kubectl wait --for=condition=Ready pod/fio
```

```output
pod/fio condition met
```

3. Run test

```shell
kubectl exec -it fio sh
fio --name fio --filename=/mnt/fio --bs=256k --rw=write --ioengine=libaio --direct=1 --iodepth=128 --numjobs=1 --size=$(blockdev --getsize64 /mnt/fio)
fio --name fio --filename=/mnt/fio --bs=4k --rw=randread --ioengine=libaio --direct=1 --iodepth=128 --numjobs=1 --size=$(blockdev --getsize64 /mnt/fio)
```

4. Cleanup

```shell
kubectl delete pod fio
kubectl delete pvc fio-pvc
# You need to delete pv when reclaimPolicy is Retain
kubectl delete pvc-d7916b34-50cd-49bd-86f9-5287db1265cb
```
