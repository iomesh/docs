---
id: install-iomesh
title: Install IOMesh
sidebar_label: Install IOMesh
---

## Installing IOMesh
IOMesh can be deployed on the kubernetes platform or Openshift container platform. If you choose to install IOMesh in a Kubernetes cluster, you can select quick installation or manual installation. Note that quick installation will take the default settings in the file, which cannot be modified manually. 

### Installing IOMesh in Kubernetes 
#### Quick Installation

1. Run the corresponding file to execute according to the version of your operating system.

   > **Note:**
   > 
   > `Helm3`, the package management tool for Kubernetes, is included in the script. It will be installed automatically if it is not found.

    <!--DOCUSAURUS_CODE_TABS-->

    <!--RHEL7/CentOS7-->

   ```shell
   # The IP address of each worker node running IOMesh must be within the IOMESH_DATA_CIDR segment.
   export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el7.sh | sh -
   ```

    <!--RHEL8/CentOS8/CoreOS-->

   ```shell
      # The IP address of each worker node running IOMesh must be within the IOMESH_DATA_CIDR segment.
       export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el8.sh | sh -
   ```
    <!--END_DOCUSAURUS_CODE_TABS-->

2. Wait for a few minutes after executing the script file, and then execute the following command. If the pods of each node in the IOMesh cluster run normally, it indicates that IOMesh is installed successfully.

   ```shell
   watch kubectl get --namespace iomesh-system pods
   ```

   > **Note:**
   > 
   > 上述脚本文件在安装结束后仍将会继续保留，以便在安装出现错误时帮助排除故障。您可以通过运行脚本 curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -，删除 IOMesh 安装脚本文件。
   
   After installation, IOMesh resources left by running the script will be saved for future troubleshooting
   
   IOMesh resources installed by running the entered script will be reserved for future troubleshooting if any error occurs during installation. You may enter the script below to remove all IOMesh resources from the Kubernetes Cluster: `curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -`**

#### Manual Installation

If you want to do some configurations on your own, follow the steps below to manually install IOMesh.

##### Installing `Helm3`

Run the commands below to install `Helm3`. Skip this step if `Helm3` is already installed.

```shell
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

For more details, please refer to **[Install Helm](https://helm.sh/docs/intro/install/)**.

##### Setting Up Helm Repo

```shell
helm repo add iomesh http://iomesh.com/charts
```

##### Installing IOMesh

1. Download `iomesh.yaml` with default configurations.

    ```shell
    helm show values iomesh/iomesh > iomesh.yaml
    ```

2. Customize `iomesh.yaml`.

   **(required)** Fill in `dataCIDR` according to your network.

    ```yaml
    iomesh:
      chunk:
        dataCIDR: "10.234.1.0/24" # change to your own data network CIDR
    ```

    **(optional)** Configure the deployment mode for the cluster, and the default is hybrid-flash deployment. For all-flash deployment, you need to set `diskDeploymentMode` to `allFlash`.

    ```yaml
    diskDeploymentMode: "hybridFlash" # set `diskDeploymentMode` to `allFlash` in all-flash deployment mode
    ```
   
   **(optional)** If you simply want IOMesh to utilize part of Kubernetes nodes, configure the labels of nodes to be utilized in `chunk.podPolicy.affinity`. For example:
   
   ```yaml
   iomesh:
     chunk:
       podPolicy:
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
               - matchExpressions:
                 - key: kubernetes.io/hostname # specific node label's key
                   operator: In
                   values:
                   - iomesh-worker-0 # specific node label's value
                   - iomesh-worker-1
    ```
    For more information about pod affinity rules, see: [pod affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity).

3. Install IOMesh Cluster.

    > **_NOTE_: Replace `iomesh` with your release name.**

    ```shell
    helm install iomesh iomesh/iomesh \
        --create-namespace \
        --namespace iomesh-system \
        --values iomesh.yaml \
        --wait
    ```

    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

4.  Run `kubectl --namespace iomesh-system get pods` to check the results.

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    ```output
    NAME                                                  READY   STATUS    RESTARTS   AGE
    csi-driver-controller-plugin-89b55d6b5-8r2fc          6/6     Running   10         2m8s
    csi-driver-controller-plugin-89b55d6b5-d4rbr          6/6     Running   10         2m8s
    csi-driver-controller-plugin-89b55d6b5-n5s48          6/6     Running   10         2m8s
    csi-driver-node-plugin-9wccv                          3/3     Running   2          2m8s
    csi-driver-node-plugin-mbpnk                          3/3     Running   2          2m8s
    csi-driver-node-plugin-x6qrk                          3/3     Running   2          2m8s
    iomesh-chunk-0                                        3/3     Running   0          52s
    iomesh-chunk-1                                        3/3     Running   0          47s
    iomesh-chunk-2                                        3/3     Running   0          43s
    iomesh-hostpath-provisioner-8fzvj                     1/1     Running   0          2m8s
    iomesh-hostpath-provisioner-gfl9k                     1/1     Running   0          2m8s
    iomesh-hostpath-provisioner-htzx9                     1/1     Running   0          2m8s
    iomesh-iscsi-redirector-96672                         2/2     Running   1          55s
    iomesh-iscsi-redirector-c2pwm                         2/2     Running   1          55s
    iomesh-iscsi-redirector-pcx8c                         2/2     Running   1          55s
    iomesh-meta-0                                         2/2     Running   0          55s
    iomesh-meta-1                                         2/2     Running   0          55s
    iomesh-meta-2                                         2/2     Running   0          55s
    iomesh-openebs-ndm-5457z                              1/1     Running   0          2m8s
    iomesh-openebs-ndm-599qb                              1/1     Running   0          2m8s
    iomesh-openebs-ndm-cluster-exporter-68c757948-gszzx   1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-kzjfc                1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-qc9pt                1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-v7sh7                1/1     Running   0          2m8s
    iomesh-openebs-ndm-operator-56cfb5d7b6-srfzm          1/1     Running   0          2m8s
    iomesh-openebs-ndm-svp9n                              1/1     Running   0          2m8s
    iomesh-zookeeper-0                                    1/1     Running   0          2m3s
    iomesh-zookeeper-1                                    1/1     Running   0          102s
    iomesh-zookeeper-2                                    1/1     Running   0          76s
    iomesh-zookeeper-operator-7b5f4b98dc-6mztk            1/1     Running   0          2m8s
    operator-85877979-66888                               1/1     Running   0          2m8s
    operator-85877979-s94vz                               1/1     Running   0          2m8s
    operator-85877979-xqtml                               1/1     Running   0          2m8s
    ```

IOMesh Cluster is now installed successfully. Please go to [Setup IOMesh](setup-iomesh.md).

[1]: http://iomesh.com/charts
[2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network

## Installing IOMesh in OpenShift

You may also install and use IOMesh through the IOMesh Operator on the OperatorHub page of the Red Hat OpenShift Container Platform.

### Pre-Install

Run the script below, which will install the dependencies of the IOMesh Operator and configure IOMesh specifications and settings for the OpenShift Cluster. Note that the script should be executed in an environment where oc or kubectl can access the OpenShift Cluster. 

```shell
curl -sSL https://iomesh.run/iomesh-operator-pre-install-openshift.sh | sh -
```

### Installing IOMesh Operator

1. Log in to the OpenShift Container Platform, then open the OperatorHub page. On the OperatorHub page, select IOMesh Operator and click Install to install IOMesh Operator.

2. Select following the order: the Installed Operators > IOMesh Operator > Create instance > YAML view, then fill in IOMesh Custom Resources according to IOMesh [YAML](https://iomesh.run/iomesh.yaml). Change the spec.*.dataCIDR to your data network CIDR.

### Installing IOMesh CSI Driver

Run the script below to install IOMesh CSI Driver. Note that the script should be executed in an environment where `oc` or `kubectl` can access the OpenShift cluster.

```shell
curl -sSL https://iomesh.run/iomesh-operator-post-install-openshift.sh | sh -
```

